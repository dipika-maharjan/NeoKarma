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
