import EMISSION_FACTORS from '../data/emissionFactors';

export interface StudentData {
  id: string;
  date: string;
  schoolId: string;
  distanceKm?: number;
  transport: string;
  plastic: boolean;
  foodWaste: boolean;
  emissions: number;
}

// Calculate emissions for a single student

export function calculateStudentEmissions(
  transport: string,
  plastic: boolean,
  foodWaste: boolean,
  distanceKm?: number
): number {
  let emissions = 0;

  const dist = distanceKm ?? EMISSION_FACTORS.default_roundtrip_km;

  // Transport: factor (kg CO2e per passenger-km) * distance (km)
  const transportFactor = (EMISSION_FACTORS.transport_per_pkm as Record<string, number>)[transport] || 0;
  emissions += transportFactor * dist;

  // Plastic usage: assumed mass per yes/no response times DEFRA waste-disposal factor.
  if (plastic) {
    emissions +=
      EMISSION_FACTORS.assumed_item_mass_kg.plastic_item *
      EMISSION_FACTORS.waste_disposal_per_kg.plastics_average_landfill;
  }

  // Food waste: assumed mass per yes/no response times DEFRA waste-disposal factor.
  if (foodWaste) {
    emissions +=
      EMISSION_FACTORS.assumed_item_mass_kg.food_waste_item *
      EMISSION_FACTORS.waste_disposal_per_kg.food_waste_landfill;
  }

  return Number(emissions.toFixed(2));
}

// Get all student data from localStorage
export function getAllStudentData(): StudentData[] {
  const data = localStorage.getItem('studentEmissions');
  return data ? JSON.parse(data) : [];
}

// Add new student data
export function addStudentData(
  schoolId: string,
  transport: string,
  plastic: boolean,
  foodWaste: boolean,
  distanceKm?: number
): StudentData {
  const emissions = calculateStudentEmissions(transport, plastic, foodWaste, distanceKm);
  const newData: StudentData = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    schoolId,
    distanceKm,
    transport,
    plastic,
    foodWaste,
    emissions,
  } as StudentData;

  const allData = getAllStudentData();
  allData.push(newData);
  localStorage.setItem('studentEmissions', JSON.stringify(allData));
  // Update per-school average distance cache
  updateSchoolAverageDistance(schoolId);

  return newData;
}

// Per-school average distance management
export function getSchoolAverageDistance(schoolId: string): number | undefined {
  const raw = localStorage.getItem('schoolAverageDistances');
  if (!raw) return undefined;
  try {
    const map = JSON.parse(raw) as Record<string, number>;
    return map[schoolId];
  } catch (e) {
    return undefined;
  }
}

export function updateSchoolAverageDistance(schoolId: string): void {
  const all = getAllStudentData();
  const distances = all.filter((d) => d.schoolId === schoolId && typeof d.distanceKm === 'number').map((d) => d.distanceKm as number);
  if (distances.length === 0) return;
  const avg = distances.reduce((s, v) => s + v, 0) / distances.length;
  const raw = localStorage.getItem('schoolAverageDistances');
  const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  map[schoolId] = Number(avg.toFixed(2));
  localStorage.setItem('schoolAverageDistances', JSON.stringify(map));
}

// Get total student emissions
export function getTotalStudentEmissions(): number {
  const allData = getAllStudentData();
  return allData.reduce((sum, data) => sum + data.emissions, 0);
}

// Get student emissions for current month
export function getCurrentMonthStudentEmissions(): number {
  const allData = getAllStudentData();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return allData
    .filter((data) => {
      const dataDate = new Date(data.date);
      return dataDate.getMonth() === currentMonth && dataDate.getFullYear() === currentYear;
    })
    .reduce((sum, data) => sum + data.emissions, 0);
}

export function getCurrentMonthStudentEmissionsBySchool(schoolId: string): number {
  const allData = getAllStudentData();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return allData
    .filter((data) => {
      const dataDate = new Date(data.date);
      return (
        data.schoolId === schoolId &&
        dataDate.getMonth() === currentMonth &&
        dataDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, data) => sum + data.emissions, 0);
}

export function getStudentEmissionsBySchool(schoolId: string): number {
  const allData = getAllStudentData();
  return allData.filter((d) => d.schoolId === schoolId).reduce((s, d) => s + d.emissions, 0);
}

// Get count of student submissions
export function getStudentSubmissionCount(): number {
  return getAllStudentData().length;
}

export function getStudentSubmissionCountBySchool(schoolId: string): number {
  return getAllStudentData().filter((d) => d.schoolId === schoolId).length;
}

export function getAvailableSchools(): string[] {
  const all = getAllStudentData();
  const set = new Set<string>();
  all.forEach((d) => set.add(d.schoolId));
  return Array.from(set);
}

// Clear all student data (for testing)
export function clearStudentData(): void {
  localStorage.removeItem('studentEmissions');
}
