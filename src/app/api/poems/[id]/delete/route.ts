import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const userEmail = req.headers.get("x-auth-email");
    const userId = req.headers.get("x-auth-user-id");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }
    

    const resolvedParams = await params;
    const poemId = parseInt(resolvedParams.id);
    
    if (isNaN(poemId)) {
      return NextResponse.json({ error: "Geçersiz şiir ID'si." }, { status: 400 });
    }


    const existingPoem = await db.select()
      .from(poems)
      .where(eq(poems.id, poemId))
      .limit(1);

    if (existingPoem.length === 0) {
      return NextResponse.json({ error: "Şiir bulunamadı." }, { status: 404 });
    }


    if (existingPoem[0].authorId !== userId) {
      return NextResponse.json({ error: "Bu şiiri silme yetkiniz yok." }, { status: 403 });
    }


    await db.delete(poems)
      .where(and(
        eq(poems.id, poemId),
        eq(poems.authorId, userId)
      ));

    return NextResponse.json({ 
      success: true, 
      message: "Şiir başarıyla silindi." 
    });

  } catch (error) {
    console.error("Şiir silinirken hata:", error);
    return NextResponse.json({ 
      error: "Şiir silinirken bir hata oluştu." 
    }, { status: 500 });
  }
}
