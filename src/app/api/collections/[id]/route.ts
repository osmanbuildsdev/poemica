import { NextResponse } from "next/server";
import { db } from "@/db";
import { collections, collectionItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";


export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
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
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon ID'si" },
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
        { success: false, message: "Koleksiyon bulunamadı" },
        { status: 404 }
      );
    }


    return NextResponse.json({ success: true, data: collection[0] });
  } catch (error) {
    console.error("Koleksiyon bilgisi getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon ID'si" },
        { status: 400 }
      );
    }


    const existingCollection = await db
      .select({ id: collections.id })
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingCollection.length === 0) {
      return NextResponse.json(
        { success: false, message: "Koleksiyon bulunamadı veya düzenleme yetkiniz yok" },
        { status: 403 }
      );
    }


    const { name, description, isPrivate, coverImage } = await request.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Koleksiyon adı gereklidir" },
        { status: 400 }
      );
    }

    const updatedCollection = await db
      .update(collections)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        isPrivate: isPrivate || false,
        coverImage: coverImage || null,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collectionId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Koleksiyon başarıyla güncellendi",
      data: updatedCollection[0],
    });
  } catch (error) {
    console.error("Koleksiyon güncellenirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
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
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { success: false, message: "Geçersiz koleksiyon ID'si" },
        { status: 400 }
      );
    }


    const existingCollection = await db
      .select({ id: collections.id })
      .from(collections)
      .where(
        and(
          eq(collections.id, collectionId),
          eq(collections.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingCollection.length === 0) {
      return NextResponse.json(
        { success: false, message: "Koleksiyon bulunamadı veya silme yetkiniz yok" },
        { status: 403 }
      );
    }


    await db.delete(collections).where(eq(collections.id, collectionId));

    return NextResponse.json({
      success: true,
      message: "Koleksiyon başarıyla silindi",
    });
  } catch (error) {
    console.error("Koleksiyon silinirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
