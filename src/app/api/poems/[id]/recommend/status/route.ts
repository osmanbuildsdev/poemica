import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(
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
    const user = auth.user;
    

    const params = await context.params;
    const poemId = Number(params.id);
    
    if (!poemId || isNaN(poemId)) {
      return NextResponse.json({ success: false, message: "Geçersiz şiir." }, { status: 400 });
    }
    

    const existing = await db.select().from(recommendations).where(and(eq(recommendations.userId, user.id), eq(recommendations.poemId, poemId)));
    
    return NextResponse.json({ 
      success: true, 
      recommended: existing.length > 0 
    });
  } catch (error) {
    console.error("Error in GET recommend status:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}
