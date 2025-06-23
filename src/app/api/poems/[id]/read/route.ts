import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedPoems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }
    const resolvedParams = await params;

    const poemId = parseInt(resolvedParams.id);
    if (isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir ID'si" },
        { status: 400 }
      );
    }


    await db
      .update(savedPoems)
      .set({ isRead: true })
      .where(
        and(
          eq(savedPoems.userId, session.user.id),
          eq(savedPoems.poemId, poemId)
        )
      );

    return NextResponse.json({ success: true, message: "Şiir okundu olarak işaretlendi" });
  } catch (error) {
    console.error("Şiir okundu olarak işaretlenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }


    const resolvedParams = await params;
    const poemId = parseInt(resolvedParams.id);
    if (isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz şiir ID'si" },
        { status: 400 }
      );
    }


    await db
      .update(savedPoems)
      .set({ isRead: false })
      .where(
        and(
          eq(savedPoems.userId, session.user.id),
          eq(savedPoems.poemId, poemId)
        )
      );

    return NextResponse.json({ success: true, message: "Şiir okunmadı olarak işaretlendi" });
  } catch (error) {
    console.error("Şiir okunmadı olarak işaretlenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
