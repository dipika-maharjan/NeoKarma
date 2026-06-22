import { fetchDashboardSummary } from '../api/dashboardApi';
import { translate as remoteTranslate } from '@/lib/utils/remoteTranslator';
import { translateLocal } from '@/lib/utils/localTranslator';

/**
 * Fetch dashboard summary and optionally translate dynamic labels
 * @param {string} targetLocale - e.g. 'en' or 'ne'
 */
export const getDashboardSummary = async (targetLocale = 'en') => {
  try {
    const response = await fetchDashboardSummary(targetLocale);
    const data = response.data?.data || null;

    if (!data) return null;

    const shouldTranslate = typeof targetLocale === 'string' && targetLocale.startsWith('ne');

    if (shouldTranslate) {
      const pending = [];
      const paths = [];

      if (data.phase) {
        const localPhase = translateLocal(data.phase, 'ne');
        if (localPhase) {
          data.phaseLabel = localPhase;
        } else if (!data.phaseLabel) {
          pending.push(data.phase);
          paths.push(['phaseLabel']);
        }
      }

      if (data.student?.locationType) {
        const localLocation = translateLocal(data.student.locationType, 'ne');
        if (localLocation) {
          data.student = {
            ...data.student,
            locationTypeLabel: localLocation
          };
        } else if (!data.student.locationTypeLabel) {
          pending.push(data.student.locationType);
          paths.push(['student', 'locationTypeLabel']);
        }
      }

      if (data.monthly?.highestEmissionCategory) {
        const localCategory = translateLocal(data.monthly.highestEmissionCategory, 'ne');
        if (localCategory) {
          data.monthly = {
            ...data.monthly,
            highestEmissionCategoryLabel: localCategory
          };
        } else if (!data.monthly.highestEmissionCategoryLabel) {
          pending.push(data.monthly.highestEmissionCategory);
          paths.push(['monthly', 'highestEmissionCategoryLabel']);
        }
      }

      if (pending.length > 0) {
        try {
          const translated = await remoteTranslate(pending, 'ne');
          const arr = Array.isArray(translated) ? translated : [translated];
          arr.forEach((val, idx) => {
            const path = paths[idx];
            if (!path) return;
            if (path.length === 1) {
              data[path[0]] = val;
            } else if (path.length === 2) {
              data[path[0]] = {
                ...(data[path[0]] || {}),
                [path[1]]: val
              };
            }
          });
        } catch (err) {
          console.warn('Dashboard summary remote label translation failed:', err.message || err);
          paths.forEach((path, idx) => {
            const source = pending[idx];
            if (!path) return;
            if (path.length === 1) {
              data[path[0]] = source;
            } else if (path.length === 2) {
              data[path[0]] = {
                ...(data[path[0]] || {}),
                [path[1]]: source
              };
            }
          });
        }
      }
    }

    return data;
  } catch (error) {
    throw error;
  }
};
