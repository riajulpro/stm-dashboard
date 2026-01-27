// Helper function to process monthly revenue data
export function processMonthlyData(
  data: { enrolledDate: Date; [key: string]: unknown }[],
  field: string,
) {
  const monthlyMap = new Map<string, number>();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyMap.set(monthYear, 0);
  }

  // Aggregate data
  data.forEach((item) => {
    const date = new Date(item.enrolledDate);
    const monthYear = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (monthlyMap.has(monthYear)) {
      monthlyMap.set(
        monthYear,
        monthlyMap.get(monthYear)! + ((item[field] as number) || 0),
      );
    }
  });

  return Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}

// Helper function to process student growth data
export function processMonthlyGrowth(
  data: { createdAt: Date; _count: { id: number } }[],
) {
  const monthlyMap = new Map<string, number>();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    monthlyMap.set(monthYear, 0);
  }

  // Aggregate data
  data.forEach((item) => {
    const date = new Date(item.createdAt);
    const monthYear = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (monthlyMap.has(monthYear)) {
      monthlyMap.set(monthYear, monthlyMap.get(monthYear)! + item._count.id);
    }
  });

  return Array.from(monthlyMap.entries()).map(([month, students]) => ({
    month,
    students,
  }));
}
