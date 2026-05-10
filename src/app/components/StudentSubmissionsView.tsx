import { StudentData, getAllStudentData } from '../utils/studentDataStorage';

const transportIcons = {
  walking: '🚶',
  bus: '🚌',
  bike: '🚲',
  motorbike: '🏍️',
  car: '🚗',
};

export function StudentSubmissionsView({ schoolId }: { schoolId?: string }) {
  const submissions = getAllStudentData();

  if (submissions.length === 0) {
    return null;
  }

  // Get current month submissions
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthSubmissions = submissions.filter((data) => {
    const dataDate = new Date(data.date);
    const inMonth = dataDate.getMonth() === currentMonth && dataDate.getFullYear() === currentYear;
    return inMonth && (schoolId ? data.schoolId === schoolId : true);
  });

  if (currentMonthSubmissions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-[1.5rem] border border-emerald-100 bg-white p-6">
      <h3 className="font-medium text-foreground mb-4">Student Submissions ({currentMonthSubmissions.length})</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {currentMonthSubmissions.map((submission) => (
          <div key={submission.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
              <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">
                {transportIcons[submission.transport as keyof typeof transportIcons] || '🚗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground capitalize">{submission.transport}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(submission.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {submission.plastic && (
                  <div className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">Plastic</div>
                )}
                {submission.foodWaste && (
                  <div className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-700">Food</div>
                )}
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-semibold text-foreground">{submission.emissions.toFixed(1)}</p>
              {submission.distanceKm !== undefined && (
                <p className="text-xs text-muted-foreground">{submission.distanceKm} km</p>
              )}
              <p className="text-xs text-muted-foreground">kg CO₂</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
