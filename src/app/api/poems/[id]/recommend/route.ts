import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations, poems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        message: auth.message 
      }, { 
        status: auth.status 
      });
    }


    const params = await context.params;
    const user = auth.user;
    const poemId = Number(params.id);
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }
    

    const poemArr = await db.select().from(poems).where(eq(poems.id, poemId));
    const poem = poemArr[0];
    if (!poem) {
      return NextResponse.json({ success: false, message: "Şiir bulunamadı." }, { status: 404 });
    }
    

    const existing = await db.select().from(recommendations).where(and(eq(recommendations.userId, user.id), eq(recommendations.poemId, poemId)));
    
    if (existing.length > 0) {

      await db.delete(recommendations).where(and(eq(recommendations.userId, user.id), eq(recommendations.poemId, poemId)));
      await db.update(poems).set({ recommends: Math.max(0, (poem.recommends || 1) - 1) }).where(eq(poems.id, poemId));
      return NextResponse.json({ success: true, recommended: false });
    } else {

      await db.insert(recommendations).values({ userId: user.id, poemId });
      await db.update(poems).set({ recommends: (poem.recommends || 0) + 1 }).where(eq(poems.id, poemId));
      return NextResponse.json({ success: true, recommended: true });
    }
  } catch (error) {
    console.error("Error in POST recommend:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}
