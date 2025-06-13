import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {

    const sessionId = request.cookies.get("sessionId")?.value;

    if (sessionId) {

      await db
        .delete(userSessions)
        .where(eq(userSessions.sessionId, sessionId));
    }


    const response = NextResponse.json({
      success: true,
      message: "Çıkış başarılı"
    });


    response.cookies.set({
      name: "sessionId",
      value: "",
      expires: new Date(0),
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Çıkış yapılırken hata:", error);
    return NextResponse.json(
      { success: false, message: "Çıkış yapılırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 