import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        authenticated: false,
        message: "Oturum açılmamış" 
      }, { status: 401 });
    }


    const now = new Date();
    const sessionResult = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessionId, sessionId),
          gte(userSessions.expiresAt, now)
        )
      );
    
    if (sessionResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        authenticated: false,
        message: "Geçersiz veya süresi dolmuş oturum" 
      }, { status: 401 });
    }
    
    const session = sessionResult[0];


    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, session.userId));

    if (userResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        authenticated: false,
        message: "Kullanıcı bulunamadı" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      authenticated: true,
      user: userResult[0]
    });

  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken hata:", error);
    return NextResponse.json(
      { success: false, message: "Kullanıcı bilgileri alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 