export interface SchoolProfile {
  schoolName: string;
  district: string;
  province: string;
  students: string;
  teachers: string;
  electricitySource: string;
  cookingFuel: string;
  transport: string;
  archetype: string;
}

const SCHOOL_SESSION_KEY = 'currentSchoolProfile';

export function saveSchoolProfile(profile: SchoolProfile): void {
  localStorage.setItem(SCHOOL_SESSION_KEY, JSON.stringify(profile));
}

export function getCurrentSchoolProfile(): SchoolProfile | null {
  const raw = localStorage.getItem(SCHOOL_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SchoolProfile;
  } catch (error) {
    return null;
  }
}

export function clearSchoolProfile(): void {
  localStorage.removeItem(SCHOOL_SESSION_KEY);
}

const SCHOOL_DATA_KEY = 'schoolData';

export function getAllSchoolData(): Record<string, any> {
  const raw = localStorage.getItem(SCHOOL_DATA_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, any>;
  } catch {
    return {};
  }
}

export function saveAllSchoolData(data: Record<string, any>): void {
  try {
    localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify(data));
  } catch {
    // ignore write failures
  }
}

function keyForProfile(profile: SchoolProfile | null): string {
  if (!profile) return 'unknown';
  return (profile.schoolName || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export function upsertCurrentSchoolData(updates: Record<string, any>): void {
  const profile = getCurrentSchoolProfile();
  const key = keyForProfile(profile);
  const all = getAllSchoolData();
  const existing = all[key] || {};
  const merged = { ...existing, profile: profile || existing.profile || null, ...updates };
  all[key] = merged;
  saveAllSchoolData(all);
}

export function getCurrentSchoolDataEntry(): any {
  const profile = getCurrentSchoolProfile();
  const key = keyForProfile(profile);
  const all = getAllSchoolData();
  return all[key] || null;
}

export type RegisteredSchoolSummary = {
  key: string;
  profile: SchoolProfile;
  schoolName: string;
  district: string;
  province: string;
  archetype: string;
  beforeCO2: number;
  afterCO2: number;
  totalCO2: number;
  co2Reduced: number;
  actionsTaken: number;
  resourcesReceived: string;
  supportedBy: string;
  entry: Record<string, any>;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function countTruthyValues(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value as Record<string, unknown>).filter(Boolean).length;
}

export function getRegisteredSchoolSummaries(): RegisteredSchoolSummary[] {
  const all = getAllSchoolData();

  return Object.entries(all)
    .map(([key, entry]) => {
      const profile = (entry?.profile || null) as SchoolProfile | null;
      if (!profile?.schoolName) return null;

      const emissionData = (entry?.emissionData || {}) as Record<string, any>;
      const selectedRecommendations = Array.isArray(entry?.selectedRecommendations) ? entry.selectedRecommendations : [];
      const schoolName = profile.schoolName;
      const beforeCO2 = toNumber(emissionData.beforeCO2 ?? entry?.beforeCO2 ?? emissionData.totalCO2 ?? entry?.totalCO2 ?? 0);
      const afterCO2 = toNumber(emissionData.afterCO2 ?? entry?.afterCO2 ?? 0);
      const totalCO2 = toNumber(emissionData.totalCO2 ?? entry?.totalCO2 ?? afterCO2 ?? beforeCO2);
      const co2Reduced = Math.max(0, beforeCO2 - (afterCO2 || totalCO2));
      const actionsTaken =
        selectedRecommendations.length +
        countTruthyValues(entry?.weekCompletion) +
        countTruthyValues(entry?.actionPhotos) +
        (entry?.mentorCommitted ? 1 : 0);

      const resourcesReceived = selectedRecommendations.length
        ? selectedRecommendations
            .map((item: any) => item?.title || item?.title_en || String(item))
            .filter(Boolean)
            .slice(0, 2)
            .join(' + ')
        : entry?.resourcesReceived || 'Registered profile';

      const supportedBy = entry?.supportedBy || (entry?.mentorCommitted ? 'Mentor Network' : ''); // Name replaced by image in UI

      return {
        key,
        profile,
        schoolName,
        district: profile.district || entry?.district || 'Unknown',
        province: profile.province || entry?.province || 'Unknown',
        archetype: profile.archetype || entry?.archetype || 'remote',
        beforeCO2,
        afterCO2,
        totalCO2,
        co2Reduced,
        actionsTaken,
        resourcesReceived,
        supportedBy,
        entry: entry as Record<string, any>,
      };
    })
    .filter((item): item is RegisteredSchoolSummary => Boolean(item))
    .sort((a, b) => b.co2Reduced - a.co2Reduced);
}

export function getRegisteredSchoolNames(): string[] {
  return getRegisteredSchoolSummaries().map((school) => school.schoolName);
}

// Migrate legacy localStorage keys for the current school into the aggregated `schoolData`.
export function migrateLegacyKeysToSchoolData(): void {
  try {
    const profile = getCurrentSchoolProfile();
    if (!profile) return;
    const key = keyForProfile(profile);
    const all = getAllSchoolData();
    const existing = all[key] || {};

    // Collect known legacy keys
    const legacy: Record<string, any> = {};
    try { legacy.selectedRecommendations = JSON.parse(localStorage.getItem('selectedRecommendations') || '[]'); } catch {};
    try { legacy.weekCompletion = JSON.parse(localStorage.getItem('weekCompletion') || '{}'); } catch {};
    try { legacy.actionPhotos = JSON.parse(localStorage.getItem('actionPhotos') || '{}'); } catch {};
    try { legacy.monthlyData = JSON.parse(localStorage.getItem('haritPathshala:monthlyData') || '{}'); } catch {};
    try { legacy.emissionData = JSON.parse(localStorage.getItem('emissionData') || '{}'); } catch {};
    try { legacy.afterCO2 = parseFloat(localStorage.getItem('afterCO2') || 'NaN'); } catch {}
    try { legacy.mentorCommitted = localStorage.getItem('mentorCommitted') === 'true'; } catch {}
    try { legacy.verificationStatus = localStorage.getItem('verificationStatus') || null; } catch {}
    try { legacy.billProof = JSON.parse(localStorage.getItem('billProof') || '{}'); } catch {}
    try { legacy.language = localStorage.getItem('language') || null; } catch {}

    const merged = {
      ...existing,
      profile: existing.profile || profile,
      monthlyData: existing.monthlyData || legacy.monthlyData || existing.monthlyData,
      emissionData: existing.emissionData || legacy.emissionData || existing.emissionData,
      selectedRecommendations: existing.selectedRecommendations || legacy.selectedRecommendations || existing.selectedRecommendations,
      weekCompletion: existing.weekCompletion || legacy.weekCompletion || existing.weekCompletion,
      actionPhotos: existing.actionPhotos || legacy.actionPhotos || existing.actionPhotos,
      afterCO2: existing.afterCO2 ?? (Number.isFinite(legacy.afterCO2) ? legacy.afterCO2 : existing.afterCO2),
      mentorCommitted: existing.mentorCommitted ?? legacy.mentorCommitted ?? existing.mentorCommitted,
      verificationStatus: existing.verificationStatus || legacy.verificationStatus || existing.verificationStatus,
      billProof: existing.billProof || legacy.billProof || existing.billProof,
      language: existing.language || legacy.language || existing.language,
    };

    all[key] = merged;
    saveAllSchoolData(all);
  } catch {
    // silent
  }
}

// Run migration once on module import to silently consolidate legacy keys.
migrateLegacyKeysToSchoolData();

// Ensure expected fields exist for the current school's `schoolData` entry.
export function ensureCurrentSchoolDataDefaults(): void {
  try {
    const profile = getCurrentSchoolProfile();
    if (!profile) return;
    const key = keyForProfile(profile);
    const all = getAllSchoolData();
    const existing = all[key] || {};

    const defaults = {
      profile: existing.profile || profile,
      name: existing.name || profile.schoolName || 'Unknown School',
      district: existing.district || profile.district || 'Unknown',
      province: existing.province || profile.province || 'Unknown',
      archetype: existing.archetype || profile.archetype || 'remote',
      totalStudents: existing.totalStudents ?? 0,
      totalTeachers: existing.totalTeachers ?? 0,
      electricitySource: existing.electricitySource || profile.electricitySource || 'unknown',
      cookingFuel: existing.cookingFuel || profile.cookingFuel || 'unknown',
      transportType: existing.transportType || profile.transport || 'unknown',
      wasteDisposal: existing.wasteDisposal || 'unknown',

      // monthlyData structure
      monthlyData: {
        ...(existing.monthlyData || {}),
        electricityBillNPR: existing.monthlyData?.electricityBillNPR ?? 0,
        dieselLiters: existing.monthlyData?.dieselLiters ?? 0,
        woodKg: existing.monthlyData?.woodKg ?? 0,
        lpgKg: existing.monthlyData?.lpgKg ?? 0,
        keroseneL: existing.monthlyData?.keroseneL ?? 0,
        walkingPercent: existing.monthlyData?.walkingPercent ?? 0,
        busPercent: existing.monthlyData?.busPercent ?? 0,
        carPercent: existing.monthlyData?.carPercent ?? 0,
        microbusPercent: existing.monthlyData?.microbusPercent ?? 0,
        avgDistanceKm: existing.monthlyData?.avgDistanceKm ?? 0,
        wasteBagsPerWeek: existing.monthlyData?.wasteBagsPerWeek ?? 0,
        bagWeightKg: existing.monthlyData?.bagWeightKg ?? 5,
      },

      // emissionData structure
      emissionData: {
        ...(existing.emissionData || {}),
        totalCO2: existing.emissionData?.totalCO2 ?? 0,
        energyCO2: existing.emissionData?.energyCO2 ?? 0,
        cookingCO2: existing.emissionData?.cookingCO2 ?? 0,
        transportCO2: existing.emissionData?.transportCO2 ?? 0,
        wasteCO2: existing.emissionData?.wasteCO2 ?? 0,
        energyPercent: existing.emissionData?.energyPercent ?? 0,
        cookingPercent: existing.emissionData?.cookingPercent ?? 0,
        transportPercent: existing.emissionData?.transportPercent ?? 0,
        wastePercent: existing.emissionData?.wastePercent ?? 0,
        biggestSource: existing.emissionData?.biggestSource || 'energy',
        electricityKwh: existing.emissionData?.electricityKwh ?? 0,
        beforeCO2: existing.emissionData?.beforeCO2 ?? existing.beforeCO2 ?? 0,
        afterCO2: existing.emissionData?.afterCO2 ?? existing.afterCO2 ?? null,
      },

      selectedRecommendations: existing.selectedRecommendations || [],
      weekCompletion: existing.weekCompletion || {},
      actionPhotos: existing.actionPhotos || {},
      billProof: existing.billProof || { before: null, after: null },
      adminConfirmed: existing.adminConfirmed ?? false,
      verificationStatus: existing.verificationStatus || 'not_started',
      impactPoints: existing.impactPoints ?? 0,
      mentorCommitted: existing.mentorCommitted ?? false,
      language: existing.language || 'en',
    } as Record<string, any>;

    all[key] = defaults;
    saveAllSchoolData(all);
  } catch {
    // silent
  }
}

ensureCurrentSchoolDataDefaults();
