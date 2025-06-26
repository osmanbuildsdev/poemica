import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { likes, poems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {  try {

    const auth = await getAuthenticatedUser(req);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { status: auth.status });
    }
    
    const user = auth.user;

    const { id } = params;
    const poemId = Number(id);
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }
    

    const existing = await db.select().from(likes).where(and(eq(likes.userId, user.id), eq(likes.poemId, poemId)));
    

    const poemArr = await db.select().from(poems).where(eq(poems.id, poemId));
    const poem = poemArr[0];
    if (!poem) {
      return NextResponse.json({ success: false, message: "Şiir bulunamadı." }, { status: 404 });
    }

    if (existing.length > 0) {

      await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.poemId, poemId)));
      await db.update(poems).set({ likes: Math.max(0, (poem.likes || 1) - 1) }).where(eq(poems.id, poemId));
      return NextResponse.json({ success: true, liked: false });
    } else {

      await db.insert(likes).values({ userId: user.id, poemId });
      await db.update(poems).set({ likes: (poem.likes || 0) + 1 }).where(eq(poems.id, poemId));
      return NextResponse.json({ success: true, liked: true });
    }  } catch (error) {
    console.error("Error in POST like:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
} 