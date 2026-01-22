import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/validations/auth";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signUpSchema.parse(body);

    const isUserExist = await db.user.findUnique({
      where: {
        email: validated.email,
      },
    });

    if (isUserExist) {
      return NextResponse.json({
        message: "User already exist with the email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validated.password, salt);

    await db.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "User successfully registered!",
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}
