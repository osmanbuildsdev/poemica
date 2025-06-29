import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
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
      }, { 
        status: auth.status 
      });
    }
    
    const user = auth.user;

    const { id } = params;
    const poemId = Number(id);
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }


    const existing = await db.select().from(recommendations).where(and(eq(recommendations.userId, user.id), eq(recommendations.poemId, poemId)));
    
    if (existing.length > 0) {

      await db.delete(recommendations).where(and(eq(recommendations.userId, user.id), eq(recommendations.poemId, poemId)));
      return NextResponse.json({ success: true, recommended: false });
    } else {

      await db.insert(recommendations).values({ userId: user.id, poemId });
      return NextResponse.json({ success: true, recommended: true });
    }  } catch (error) {
    console.error("Error in POST recommend:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
} 