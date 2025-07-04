import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ 
      success: true, 
      users: allUsers 
    });

  } catch (error) {
    console.error("Kullanıcılar getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Kullanıcılar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 