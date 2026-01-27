export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalBatches: number;
    totalCourses: number;
    activeCourses: number;
    totalRevenue: number;
    pendingPayments: number;
    attendanceRate: number;
  };
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    studentGrowth: Array<{ month: string; students: number }>;
    courseEnrollments: Array<{ courseName: string; enrollments: number }>;
    attendanceStats: Array<{ status: string; count: number }>;
  };
  recentActivities: {
    recentStudents: Array<{
      id: string;
      name: string;
      batch: string;
      joinedDate: string;
      avatar?: string;
    }>;
    topPerformers: Array<{
      studentId: string;
      name: string;
      avatar?: string;
      averageMarks: string;
    }>;
    recentFeedbacks: Array<{
      id: string;
      studentName: string;
      feedback: string;
      rating?: number;
      date: string;
    }>;
  };
  upcomingClasses: Array<{
    id: string;
    courseName: string;
    batchName: string;
    schedule: Array<{ day: string; startTime: string; endTime: string }>;
  }>;
}
