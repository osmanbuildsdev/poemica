import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedPoems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }


    const params = await context.params;
    const poemId = parseInt(params.id);
    if (isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir ID'si" },
        { status: 400 }
      );
    }

    const { isArchived } = await request.json();


    await db.insert(savedPoems).values({
      userId: session.user.id,
      poemId,
      isArchived: isArchived || false,
      isRead: false,
    }).onConflictDoUpdate({
      target: [savedPoems.userId, savedPoems.poemId],
      set: {
        isArchived: isArchived || false,
      },
    });

    return NextResponse.json({ success: true, message: "Şiir başarıyla kaydedildi" });
  } catch (error) {
    console.error("Şiir kaydedilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }


    const params = await context.params;
    const poemId = parseInt(params.id);
    if (isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir ID'si" },
        { status: 400 }
      );
    }


    await db
      .delete(savedPoems)
      .where(
        and(
          eq(savedPoems.userId, session.user.id),
          eq(savedPoems.poemId, poemId)
        )
      );

    return NextResponse.json({ success: true, message: "Şiir başarıyla kaydından kaldırıldı" });
  } catch (error) {
    console.error("Şiir kaydı silinirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }


    const params = await context.params;
    const poemId = parseInt(params.id);
    if (isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir ID'si" },
        { status: 400 }
      );
    }


    const savedPoemRecord = await db
      .select()
      .from(savedPoems)
      .where(
        and(
          eq(savedPoems.userId, session.user.id),
          eq(savedPoems.poemId, poemId)
        )
      )
      .limit(1);

    const isSaved = savedPoemRecord.length > 0;
    const details = isSaved 
      ? { 
          isArchived: savedPoemRecord[0].isArchived,
          isRead: savedPoemRecord[0].isRead
        } 
      : null;

    return NextResponse.json({ 
      success: true, 
      isSaved,
      details
    });
  } catch (error) {
    console.error("Şiir kayıt durumu kontrol edilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
