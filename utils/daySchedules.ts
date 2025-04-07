export interface DaySchedule {
  day: string;
  dates: string[];
}

export const getDaySchedules = (
  courseStart: Date,
  courseEnd: Date
): DaySchedule[] => {
  if (!courseStart || !courseEnd) {
    throw new Error("Invalid course dates provided");
  }

  const startDate = new Date(courseStart);
  const endDate = new Date(courseEnd);

  if (startDate > endDate) {
    throw new Error("Course start date cannot be after end date");
  }

  const schedules: DaySchedule[] = [];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  days.forEach((day) => {
    schedules.push({ day, dates: [] });
  });

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayName = currentDate.toDateString().split(" ")[0].toUpperCase();
    const schedule = schedules.find((s) => s.day === dayName);

    if (schedule) {
      schedule.dates.push(currentDate.toDateString());
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules.filter((schedule) => schedule.dates.length > 0);
};
