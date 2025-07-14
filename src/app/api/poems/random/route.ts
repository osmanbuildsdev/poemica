import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { poems, users } from "@/db/schema";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const excludeParam = searchParams.get("exclude");
    let excludeIds: number[] = [];
    if (excludeParam) {
      excludeIds = excludeParam.split(",").map((id) => parseInt(id, 10)).filter(Boolean);
    }


    let allPoems = await db.select().from(poems);
    

    if (!allPoems || allPoems.length === 0) {
      return NextResponse.json({ success: false, message: "Henüz şiir bulunamadı." }, { status: 404 });
    }
    

    let availablePoems = allPoems;
    if (excludeIds.length > 0) {
      availablePoems = allPoems.filter((p: any) => !excludeIds.includes(p.id));
    }
    

    if (availablePoems.length === 0) {
      availablePoems = allPoems;
    }
    
    const randomIndex = Math.floor(Math.random() * availablePoems.length);
    const poem = availablePoems[randomIndex];
    

    const allUsers = await db.select().from(users);
    const author = allUsers.find((u: any) => u.id === poem.authorId);
    
    return NextResponse.json({ 
      success: true, 
      data: { ...poem, author },
      resetSeen: excludeIds.length > 0 && availablePoems.length === allPoems.length
    });
  } catch (error) {
    console.error("Random poem error:", error);
    return NextResponse.json({ success: false, message: "Bir hata oluştu." }, { status: 500 });
  }
}
