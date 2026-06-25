'use client';

import { useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import apiClient from '@/lib/api/axios';
import { useToast } from '@/context/ToastContext';

// Import existing action functions to preserve dynamic data mapping, localizations, and formatting
import { getDashboardSummary } from '@/lib/actions/dashboardActions';
import { getTodayLog, getDailyLogHistory } from '@/lib/actions/calculatorActions';
import { getScoreConfig } from '@/lib/actions/scoreConfigActions';
import { getStreak } from '@/lib/actions/streakActions';
import { getCarbonMirror } from '@/lib/actions/mirrorActions';
import { getActivePlan } from '@/lib/actions/mitigationPlanActions';
import { getAppConfig } from '@/lib/actions/configActions';

/**
 * Custom fetcher for useApi that routes requests through action functions when possible,
 * falling back to standard axios GET requests.
 */
const createFetcher = (showToast, autoToastError) => async (key) => {
  try {
    let url = key;
    let params = null;
    
    if (Array.isArray(key)) {
      url = key[0];
      params = key[1];
    }

    switch (url) {
      case '/dashboard/summary':
        return await getDashboardSummary(params?.locale || 'en');
      case '/daily-log/today':
        return await getTodayLog();
      case '/score-config':
        return await getScoreConfig();
      case '/daily-log/history':
        return await getDailyLogHistory(params || {});
      case '/streak':
        return await getStreak();
      case '/carbon-mirror':
        return await getCarbonMirror(params?.locale || 'en');
      case '/mitigation-plan':
        return await getActivePlan();
      case '/config':
        return await getAppConfig();
      default:
        // Fallback for custom or direct endpoints
        const response = await apiClient.get(url, { params });
        return response.data;
    }
  } catch (error) {
    if (autoToastError) {
      showToast(error.message || 'Failed to fetch data', { type: 'error' });
    }
    throw error;
  }
};

/**
 * useApi hook for data fetching and mutations (GET, POST, PUT, PATCH, DELETE)
 * 
 * @param {string|Array|null} key - API endpoint or SWR key. Pass null to skip fetching.
 * @param {Object} options - SWR configuration options and hook settings.
 * @param {boolean} options.autoToastError - Whether to automatically show a toast notification on error (default: true).
 */
export function useApi(key, options = {}) {
  const { showToast } = useToast();
  const {
    autoToastError = true,
    ...swrOptions
  } = options;

  const fetcher = createFetcher(showToast, autoToastError);
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetcher, swrOptions);

  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  /**
   * Helper function to execute a mutation request (POST, PUT, PATCH, DELETE)
   */
  const executeMutation = async (method, url, body = null, mutationOpts = {}) => {
    const {
      optimisticData,
      rollbackOnError = true,
      revalidate = true,
      autoToast = autoToastError,
      onSuccess,
      onError
    } = mutationOpts;

    setMutationLoading(true);
    setMutationError(null);

    const performRequest = async () => {
      let response;
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      switch (method) {
        case 'POST':
          response = await apiClient.post(url, body, config);
          break;
        case 'PUT':
          response = await apiClient.put(url, body, config);
          break;
        case 'PATCH':
          response = await apiClient.patch(url, body, config);
          break;
        case 'DELETE':
          response = await apiClient.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      return response.data;
    };

    try {
      let result;
      if (optimisticData !== undefined && key) {
        // If optimisticData is provided and we have an active SWR key, leverage SWR's optimistic mutate
        result = await mutate(performRequest(), {
          optimisticData,
          rollbackOnError,
          revalidate
        });
      } else {
        // Standard request execution and option to revalidate the cache key
        const responseData = await performRequest();
        result = await mutate(responseData, { revalidate: key ? revalidate : false });
      }

      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errMsg = err.message || 'Action failed';
      setMutationError(err);
      if (autoToast) {
        showToast(errMsg, { type: 'error' });
      }
      if (onError) onError(err);
      throw err;
    } finally {
      setMutationLoading(false);
    }
  };

  const post = (body, opts = {}) => executeMutation('POST', opts.url || key, body, opts);
  const put = (body, opts = {}) => executeMutation('PUT', opts.url || key, body, opts);
  const patch = (body, opts = {}) => executeMutation('PATCH', opts.url || key, body, opts);
  const del = (opts = {}) => executeMutation('DELETE', opts.url || key, null, opts);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    post,
    put,
    patch,
    delete: del,
    mutationLoading,
    mutationError
  };
}

/**
 * useInfiniteApi hook for cursor-based loading and paginated scroll lists.
 * 
 * @param {string} url - Base API endpoint.
 * @param {Object} options - Pagination options.
 * @param {string} options.cursorParam - Query parameter name for the cursor (default: 'cursor').
 * @param {string} options.limitParam - Query parameter name for the limit (default: 'limit').
 * @param {number} options.limit - Number of items to fetch per page (default: 10).
 * @param {function} options.getCursor - Callback to extract the next cursor value from page response.
 * @param {boolean} options.autoToastError - Whether to automatically show a toast notification on error (default: true).
 */
export function useInfiniteApi(url, options = {}) {
  const { showToast } = useToast();
  const {
    cursorParam = 'cursor',
    limitParam = 'limit',
    limit = 10,
    getCursor = (pageData) => pageData?.nextCursor || pageData?.cursor || null,
    autoToastError = true,
    ...swrOptions
  } = options;

  const getKey = (pageIndex, previousPageData) => {
    if (!url) return null;

    // Stop fetching if there was previous page data but no cursor
    if (pageIndex > 0 && !getCursor(previousPageData)) {
      return null;
    }

    const separator = url.includes('?') ? '&' : '?';
    let query = `${url}${separator}${limitParam}=${limit}`;

    if (pageIndex > 0) {
      const cursor = getCursor(previousPageData);
      query += `&${cursorParam}=${encodeURIComponent(cursor)}`;
    }

    return query;
  };

  const fetcher = async (pageUrl) => {
    try {
      const response = await apiClient.get(pageUrl);
      return response.data;
    } catch (error) {
      if (autoToastError) {
        showToast(error.message || 'Failed to fetch page data', { type: 'error' });
      }
      throw error;
    }
  };

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate
  } = useSWRInfinite(getKey, fetcher, swrOptions);

  // Flattened array of all fetched items across pages
  const items = data ? data.flatMap((page) => {
    if (Array.isArray(page)) return page;
    if (Array.isArray(page.data)) return page.data;
    if (Array.isArray(page.items)) return page.items;
    return [];
  }) : [];

  // Determine if we have reached the end of results
  const isReachingEnd = data && (
    data[data.length - 1]?.length === 0 ||
    !getCursor(data[data.length - 1])
  );

  const loadMore = () => {
    if (!isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  };

  return {
    data,
    items,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
    isReachingEnd,
    loadMore
  };
}
