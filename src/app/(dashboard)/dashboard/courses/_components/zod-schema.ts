import { z } from "zod";

export const CourseSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"), // or z.string().uuid() if you prefer

  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title is too long"),

  description: z.string().max(2000, "Description is too long").nullish(), // allows null or undefined

  courseFee: z
    .number()
    .positive("Course fee must be positive")
    .max(100000, "Course fee seems unreasonably high"),

  courseDuration: z
    .number()
    .int("Duration must be whole number of months")
    .min(1, "Minimum 1 month")
    .max(48, "Maximum 48 months"),

  courseFor: z.string().min(2).max(50),

  isActive: z.boolean().default(true),

  teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid teacher ID"),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date(),

  // Optional: if you sometimes include relations (very common pattern)
  teacher: z.any().optional(), // or better: TeacherSchema
  subscriptions: z.array(z.any()).optional(),
  routines: z.array(z.any()).optional(),
  results: z.array(z.any()).optional(),
});

// For creating new course (most fields required, id & timestamps optional)
export const CreateCourseSchema = CourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  teacher: true, // usually set from session/auth
  subscriptions: true,
  routines: true,
  results: true,
}).extend({
  teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

// For updating course (everything optional except maybe id)
export const UpdateCourseSchema = CourseSchema.partial()
  .required({ id: true })
  .omit({
    createdAt: true,
    updatedAt: true,
    teacher: true,
    subscriptions: true,
    routines: true,
    results: true,
  });
