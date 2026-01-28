"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  UserPlus,
  Trophy,
  MessageSquare,
  CalendarX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardData } from "@/types/dashboard-stats";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface Props {
  stats: DashboardData;
}

export default function DashboardStatistics({ stats }: Props) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {"Failed to load statistics"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasRecentStudents = stats.recentActivities.recentStudents.length > 0;
  const hasTopPerformers = stats.recentActivities.topPerformers.length > 0;
  const hasRecentFeedbacks = stats.recentActivities.recentFeedbacks.length > 0;
  const hasUpcomingClasses = stats.upcomingClasses.length > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {`Welcome back! Here's an overview of your teaching platform.`}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {stats.overview.totalBatches} batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.activeCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {stats.overview.totalCourses} total courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.overview.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.overview.pendingPayments.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.attendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue trend over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-75"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Student Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Student Growth</CardTitle>
            <CardDescription>New students enrolled per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                students: {
                  label: "New Students",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-75"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.studentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="var(--color-students)"
                    name="New Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Enrollments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollments</CardTitle>
            <CardDescription>Active enrollments by course</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.charts.courseEnrollments.length > 0 ? (
              <ChartContainer
                config={{
                  enrollments: {
                    label: "Enrollments",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-75"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.charts.courseEnrollments}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="courseName" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="enrollments"
                      fill="var(--color-enrollments)"
                      name="Enrollments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-75 text-muted-foreground">
                <BookOpen className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No course enrollments yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Stats Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Last 30 days breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.charts.attendanceStats.some((stat) => stat.count > 0) ? (
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-75"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.charts.attendanceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={100}
                      fill="var(--color-count)"
                      dataKey="count"
                    >
                      {stats.charts.attendanceStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-75 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No attendance data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Info */}
      <TooltipProvider>
        <Tabs defaultValue="recent-students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent-students">Recent Students</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="feedbacks">Recent Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="recent-students">
            <Card>
              <CardHeader>
                <CardTitle>Recently Enrolled Students</CardTitle>
                <CardDescription>
                  Latest students who joined your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasRecentStudents ? (
                  <div className="space-y-4">
                    {stats.recentActivities.recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={student.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.batch}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(student.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <UserPlus className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">
                      No recent students
                    </h3>
                    <p className="text-sm">
                      New student enrollments will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-performers">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Based on average exam scores</CardDescription>
              </CardHeader>
              <CardContent>
                {hasTopPerformers ? (
                  <div className="space-y-4">
                    {stats.recentActivities.topPerformers.map(
                      (student, index) => (
                        <div
                          key={student.studentId}
                          className="flex items-center gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <Award
                              className={`h-5 w-5 ${
                                index === 0
                                  ? "text-yellow-500"
                                  : index === 1
                                    ? "text-gray-400"
                                    : index === 2
                                      ? "text-amber-700"
                                      : "text-muted-foreground"
                              }`}
                            />
                            <Avatar>
                              <AvatarImage
                                src={student.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Average: {student.averageMarks}%
                            </p>
                          </div>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Trophy className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">
                      No performance data yet
                    </h3>
                    <p className="text-sm text-center">
                      Add exam results to see top performing students
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedbacks">
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest feedback from students</CardDescription>
              </CardHeader>
              <CardContent>
                {hasRecentFeedbacks ? (
                  <div className="space-y-4">
                    {stats.recentActivities.recentFeedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border-b pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {feedback.studentName}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {feedback.feedback}
                            </p>
                          </div>
                          {feedback.rating && (
                            <Badge variant="outline">
                              ⭐ {feedback.rating}/5
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(feedback.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">
                      No feedback yet
                    </h3>
                    <p className="text-sm">
                      Student feedback will be displayed here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TooltipProvider>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Classes
          </CardTitle>
          <CardDescription>Your scheduled classes and routines</CardDescription>
        </CardHeader>
        <CardContent>
          {hasUpcomingClasses ? (
            <div className="space-y-3">
              {stats.upcomingClasses.slice(0, 5).map((routine) => (
                <div
                  key={routine.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{routine.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {routine.batchName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col gap-1">
                      {routine.schedule.map((scheduleItem, index) => (
                        <Badge key={index} variant="outline">
                          {scheduleItem.day}: {scheduleItem.startTime} -{" "}
                          {scheduleItem.endTime}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CalendarX className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No upcoming classes</h3>
              <p className="text-sm">
                Create routines to see your schedule here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
