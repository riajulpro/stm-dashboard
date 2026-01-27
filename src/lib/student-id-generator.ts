import { db } from "@/lib/prisma";

/**
 * Generates a unique student ID with the format: EHA-{BATCH_SHORT}-{NUMBER}
 * Example: EHA-M1-0001, EHA-M1-0002, etc.
 *
 * @param batchName - The full batch name (e.g., "Morning Batch 1")
 * @param teacherId - The teacher's ID to ensure uniqueness per teacher
 * @returns A unique student ID
 **/
export async function generateStudentId(
  batchName: string,
  teacherId: string,
): Promise<string> {
  // Generate batch short name from batch name
  const batchShort = generateBatchShortName(batchName);

  // Prefix for all student IDs
  const prefix = `EHA-${batchShort}`;

  // Find the latest student ID with this prefix for this teacher
  const latestStudent = await db.student.findFirst({
    where: {
      teacherId,
      studentId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      studentId: "desc",
    },
    select: {
      studentId: true,
    },
  });

  let nextNumber = 1;

  if (latestStudent) {
    // Extract the number from the latest student ID
    // Format: EHA-M1-0001 -> extract "0001"
    const match = latestStudent.studentId.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format the number with leading zeros (4 digits)
  const formattedNumber = nextNumber.toString().padStart(4, "0");

  // Generate the final student ID
  const studentId = `${prefix}-${formattedNumber}`;

  // Double-check uniqueness (in case of race conditions)
  const exists = await db.student.findFirst({
    where: {
      teacherId,
      studentId,
    },
  });

  if (exists) {
    // If somehow it exists, recursively try the next number
    return generateStudentId(batchName, teacherId);
  }

  return studentId;
}

/**
 * Generates a short name from batch name
 * Examples:
 * - "Morning Batch 1" -> "M1"
 * - "Evening Batch A" -> "EA"
 * - "SSC 2024" -> "S24"
 * - "HSC Batch" -> "HB"
 * - "Class 10 Morning" -> "C10M"
 */
function generateBatchShortName(batchName: string): string {
  // Remove common words
  const commonWords = ["batch", "class", "the", "and", "of"];

  // Split by spaces and filter
  const words = batchName
    .toLowerCase()
    .split(/[\s-_]+/)
    .filter((word) => !commonWords.includes(word));

  if (words.length === 0) {
    // Fallback: use first 3 characters
    return batchName.substring(0, 3).toUpperCase();
  }

  // Strategy 1: If there's a number, use first letter + number
  const numberWord = words.find((word) => /\d/.test(word));
  if (numberWord) {
    const firstWord = words[0];
    const number = numberWord.match(/\d+/)?.[0] || "";
    return `${firstWord.charAt(0).toUpperCase()}${number}`;
  }

  // Strategy 2: Use first letter of each word (max 3 letters)
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }

  // Strategy 3: Use first 2-3 characters of single word
  return words[0].substring(0, words[0].length >= 4 ? 3 : 2).toUpperCase();
}

/**
 * Validates if a student ID follows the correct format
 * Format: EHA-{BATCH_SHORT}-{4_DIGIT_NUMBER}
 */
export function isValidStudentIdFormat(studentId: string): boolean {
  const pattern = /^EHA-[A-Z0-9]+-\d{4}$/;
  return pattern.test(studentId);
}

/**
 * Extracts the batch short name from a student ID
 * Example: "EHA-M1-0001" -> "M1"
 */
export function extractBatchShortFromStudentId(
  studentId: string,
): string | null {
  const match = studentId.match(/^EHA-([A-Z0-9]+)-\d{4}$/);
  return match ? match[1] : null;
}

/**
 * Gets the next available student ID without creating it
 * Useful for previewing what the next ID will be
 */
export async function previewNextStudentId(
  batchName: string,
  teacherId: string,
): Promise<string> {
  return generateStudentId(batchName, teacherId);
}
