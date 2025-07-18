import { NextResponse } from "next/server";
import { db } from "@/db";
import { collections, collectionItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; poemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const collectionId = parseInt(params.id);
    const poemId = parseInt(params.poemId);
    
    if (isNaN(collectionId) || isNaN(poemId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon veya şiir ID'si" },
        { status: 400 }
      );
    }


    const collection = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, session.user.id)
        )
      )
      .limit(1);

    if (collection.length === 0) {
      return NextResponse.json(
        { success: false, message: "Koleksiyon bulunamadı veya erişim yetkiniz yok" },
        { status: 403 }
      );
    }


    await db
      .delete(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, collectionId),
          eq(collectionItems.poemId, poemId)
        )
      );


    await db
      .update(collections)
      .set({ updatedAt: new Date() })
      .where(eq(collections.id, collectionId));

    return NextResponse.json({
      success: true,
      message: "Şiir koleksiyondan başarıyla kaldırıldı",
    });
  } catch (error) {
    console.error("Şiir koleksiyondan çıkarılırken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
