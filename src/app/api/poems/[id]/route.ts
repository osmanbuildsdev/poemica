import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const poemId = parseInt(params.id);

    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }    const poem = await db.query.poems.findFirst({
      where: eq(poems.id, poemId),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      columns: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        coverImage: true,
        tags: true,
        likes: true,
        views: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!poem) {
      return NextResponse.json({ error: "Şiir bulunamadı" }, { status: 404 });
    }

    await db.update(poems)
      .set({ views: (poem.views ?? 0) + 1 })
      .where(eq(poems.id, poem.id));

    return NextResponse.json({ poem });
  } catch (error) {
    console.error("Şiir getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const poemId = parseInt(params.id);

    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ error: "Geçersiz şiir ID'si." }, { status: 400 });
    }


    const userEmail = req.headers.get("x-auth-email");
    const userId = req.headers.get("x-auth-user-id");

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, tags } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Başlık ve içerik alanları zorunludur." }, { status: 400 });
    }


    const existingPoem = await db.select()
      .from(poems)
      .where(eq(poems.id, poemId))
      .limit(1);

    if (existingPoem.length === 0) {
      return NextResponse.json({ error: "Şiir bulunamadı." }, { status: 404 });
    }


    if (existingPoem[0].authorId !== userId) {
      return NextResponse.json({ error: "Bu şiiri güncelleme yetkiniz yok." }, { status: 403 });
    }
    const updatedPoem = await db.update(poems)
      .set({
        title: title.trim(),
        content: content.trim(),
        tags: Array.isArray(tags) ? tags : [],
        updatedAt: new Date()
      })
      .where(eq(poems.id, poemId))
      .returning();

    return NextResponse.json({ 
      success: true, 
      poem: updatedPoem[0],
      message: "Şiir başarıyla güncellendi." 
    });

  } catch (error) {
    console.error("Şiir güncellenirken hata:", error);
    return NextResponse.json({ 
      error: "Şiir güncellenirken bir hata oluştu." 
    }, { status: 500 });
  }
}
