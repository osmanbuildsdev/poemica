import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {

    const resolvedParams = await params;
    const poemId = resolvedParams.id;
    


    const existingPoem = await db
      .select({ id: poems.id, views: poems.views })
      .from(poems)
      .where(sql`${poems.id}::text = ${poemId}`)
      .limit(1);
    
    if (!existingPoem || existingPoem.length === 0) {
      return NextResponse.json(
        { success: false, message: "Şiir bulunamadı" },
        { status: 404 }
      );
    }

    const currentViews = existingPoem[0].views || 0;
    await db
      .update(poems)
      .set({ views: currentViews + 1 })
      .where(sql`${poems.id}::text = ${poemId}`);
    
    return NextResponse.json({
      success: true,
      message: "Görüntülenme kaydedildi",
      views: currentViews + 1
    });
  } catch (error) {
    console.error("Görüntülenme kaydedilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Görüntülenme kaydedilemedi" },
      { status: 500 }
    );
  }
}
