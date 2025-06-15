import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import authOptions from "./auth";

export async function getAuthenticatedUser(req: NextRequest) {
  try {

    let userEmail = req.headers.get('x-auth-email');
    let userId = req.headers.get('x-auth-user-id');
    

    if (!userEmail) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);


        userEmail = token;
      }
    }
    

    if (!userEmail) {
      console.log("Auth failed: No user email found in headers or Authorization");
      return {
        success: false as const,
        status: 401,
        message: 'Lütfen giriş yapın.'
      };
    }


    const session = await getServerSession(authOptions);


    const userArr = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));

    const user = userArr[0];

    if (!user) {
      return {
        success: false as const,
        status: 404,
        message: 'Kullanıcı bulunamadı.'
      };
    }


    if (userId && user.id !== userId) {
      return {
        success: false as const,
        status: 401,
        message: 'Yetkilendirme başarısız.'
      };
    }

    return {
      success: true as const,
      user,
      session
    };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      success: false as const,
      error: "Internal Server Error",
      status: 500,
      message: "Kimlik doğrulama sırasında bir hata oluştu."
    };
  }
}
