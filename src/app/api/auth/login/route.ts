import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email ve şifre gerekli" },
        { status: 400 }
      );
    }


    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userResults.length === 0) {
      return NextResponse.json(
        { success: false, message: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    const user = userResults[0];


    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }


    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(userSessions).values({
      userId: user.id,
      sessionId,
      expiresAt
    });
    const cookieStore = await cookies();
    cookieStore.set({
      name: "sessionId",
      value: sessionId,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax"
    });

    return NextResponse.json({
      success: true,
      message: "Giriş başarılı",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Giriş yapılırken hata:", error);
    return NextResponse.json(
      { success: false, message: "Giriş yapılırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 