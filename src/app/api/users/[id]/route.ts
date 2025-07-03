
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function GET(req: NextRequest) {

  const urlParts = req.nextUrl.pathname.split('/');
  const userId = urlParts[urlParts.length - 1];
  try {
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Geçersiz kullanıcı ID'si." },
        { status: 400 }
      );
    }


    try {
      const userArr = await db.select().from(users).where(eq(users.id, userId));
      if (!userArr || userArr.length === 0) {
        return NextResponse.json(
          { success: false, message: "Kullanıcı bulunamadı." },
          { status: 404 }
        );
      }
      const user = userArr[0];

      const { password, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return NextResponse.json(
        { success: false, message: "Veritabanı sorgusu sırasında hata oluştu." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Kullanıcı getirme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {

    const session = await getServerSession(authOptions);
    const params = await context.params;
    

    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: "Bu işlem için yetkiniz yok." }, 
        { status: 401 }
      );
    }
    

    const userId = params.id;
    const body = await req.json();
    

    const { name, bio, location, websiteUrl, image } = body;

    await db.update(users)
      .set({ 
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        websiteUrl: websiteUrl || undefined,
        image: image || undefined,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    

    const updatedUserArr = await db.select().from(users).where(eq(users.id, userId));
    const updatedUser = updatedUserArr[0];
    
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Profil güncellenirken bir hata oluştu." }, 
      { status: 500 }
    );
  }
}
