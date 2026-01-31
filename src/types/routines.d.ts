export interface RoutineSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Routine {
  id: string;
  courseId: string;
  batchId: string;
  schedule: RoutineSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    courseFor?: string;
  };
  batch: {
    id: string;
    batchName: string;
    batchYear?: string | null;
  };
}
