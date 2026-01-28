// Dashboard Overview Statistics
export interface DashboardOverview {
  totalStudents: number;
  totalBatches: number;
  totalCourses: number;
  activeCourses: number;
  totalRevenue: number;
  pendingPayments: number;
  attendanceRate: number;
}

// Monthly Revenue Data Point
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

// Student Growth Data Point
export interface StudentGrowthData {
  month: string;
  students: number;
}

// Course Enrollment Data
export interface CourseEnrollmentData {
  courseName: string;
  enrollments: number;
}

// Attendance Statistics
export interface AttendanceStatsData {
  status: string; // 'Present' | 'Absent' | 'Late' | 'Excused' - use string for flexibility
  count: number;
}

// Charts Data Container
export interface DashboardCharts {
  monthlyRevenue: MonthlyRevenueData[];
  studentGrowth: StudentGrowthData[];
  courseEnrollments: CourseEnrollmentData[];
  attendanceStats: AttendanceStatsData[];
}

// Recent Student Data
export interface RecentStudent {
  id: string;
  name: string;
  batch: string;
  joinedDate: string | Date; // ISO date string or Date object
  avatar: string | null;
}

// Top Performer Data
export interface TopPerformer {
  studentId: string;
  name: string;
  avatar: string | null | undefined;
  averageMarks: string;
}

// Recent Feedback Data
export interface RecentFeedback {
  id: string;
  studentName: string;
  feedback: string;
  rating: number | null;
  date: Date | string; // Changed from feedbackDate
}

// Recent Activities Container
export interface RecentActivities {
  recentStudents: RecentStudent[];
  topPerformers: TopPerformer[];
  recentFeedbacks: RecentFeedback[];
}

// Upcoming Class Data
export interface UpcomingClass {
  id: string;
  courseName: string;
  batchName: string;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

// Main Dashboard Data Interface
export interface DashboardData {
  overview: DashboardOverview;
  charts: DashboardCharts;
  recentActivities: RecentActivities;
  upcomingClasses: UpcomingClass[];
}

// ============================================
// Optional: Type Guards for Runtime Validation
// ============================================

export function isDashboardData(data: unknown): data is DashboardData {
  if (typeof data !== "object" || data === null) return false;

  const d = data as Record<string, unknown>;

  return (
    typeof d.overview === "object" &&
    d.overview !== null &&
    typeof d.charts === "object" &&
    d.charts !== null &&
    typeof d.recentActivities === "object" &&
    d.recentActivities !== null &&
    Array.isArray(d.upcomingClasses)
  );
}

// ============================================
// Optional: Helper Types for API Responses
// ============================================

export type DashboardApiResponse =
  | {
      success: true;
      data: DashboardData;
    }
  | {
      success: false;
      error: string;
    };

// ============================================
// Optional: Filtering and Sorting Types
// ============================================

export type DateRangeFilter = {
  startDate: string | Date; // ISO date string or Date object
  endDate: string | Date; // ISO date string or Date object
};

export type DashboardFilters = {
  dateRange?: DateRangeFilter;
  batchId?: string;
  courseId?: string;
};

// ============================================
// Extended Types Based on Prisma Schema
// ============================================

// If you need more detailed student information from the Student model
export interface DetailedStudent extends RecentStudent {
  studentId: string;
  institutionName: string;
  class: string;
  gender: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | Date | null; // ISO date string or Date object
  guardianName?: string | null;
  guardianPhone?: string | null;
  batchId: string;
  teacherId: string;
  createdAt: string | Date; // ISO date string or Date object
  updatedAt: string | Date; // ISO date string or Date object
}

// If you need more detailed course information
export interface DetailedCourse {
  id: string;
  title: string;
  description?: string | null;
  courseFee: number;
  courseDuration: number;
  courseFor: string;
  isActive: boolean;
  teacherId: string;
  createdAt: string | Date; // ISO date string or Date object
  updatedAt: string | Date; // ISO date string or Date object
}

// If you need batch information
export interface BatchInfo {
  id: string;
  batchName: string;
  batchYear?: string | null;
  teacherId: string;
  createdAt: string | Date; // ISO date string or Date object
  updatedAt: string | Date; // ISO date string or Date object
}

// ============================================
// Chart Configuration Types (for frontend use)
// ============================================

export type ChartType = "line" | "bar" | "pie" | "doughnut";

export interface ChartConfig {
  type: ChartType;
  data:
    | MonthlyRevenueData[]
    | StudentGrowthData[]
    | CourseEnrollmentData[]
    | AttendanceStatsData[];
  title: string;
  color?: string;
}
