export interface ISubscription {
  id: string;
  enrolledDate: Date;
  validTill: Date;
  isActive: boolean;
  paymentStatus: "paid" | "pending" | "failed";
  amountPaid: number;

  student: {
    studentId: string;
    name: string;
    avatar: string | null;
    email: string | null;
  };

  course: {
    title: string;
    courseFee: number;
    courseDuration: number;
  };
}
