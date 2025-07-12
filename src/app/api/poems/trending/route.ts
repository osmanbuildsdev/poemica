import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { poems, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") || "9");
    const offset = Number(request.nextUrl.searchParams.get("offset") || "0");
    const timeFrame = request.nextUrl.searchParams.get("timeFrame") || "all";
    
    console.log(`API isteği alındı: limit=${limit}, offset=${offset}, timeFrame=${timeFrame}`);
    

    let dateFilter = undefined;
    if (timeFrame !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (timeFrame) {
        case "daily":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "weekly":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "monthly":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      


    }
    

    let query = db
      .select({
        id: poems.id,
        title: poems.title,
        content: poems.content,
        authorId: poems.authorId,
        coverImage: poems.coverImage,
        tags: poems.tags,
        likes: poems.likes,
        views: poems.views,
        createdAt: poems.createdAt,
        updatedAt: poems.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          image: users.image
        }
      })
      .from(poems)
      .innerJoin(users, eq(poems.authorId, users.id))
      .orderBy(
        desc(sql`(${poems.likes} * 2 + ${poems.views} / 10)`),
        desc(poems.createdAt)
      )
      .limit(limit)
      .offset(offset);
      




    
    const trendingPoems = await query;
    
    console.log(`${trendingPoems.length} adet trending poem bulundu`);
    

    if (trendingPoems.length === 0 && process.env.NODE_ENV === 'development') {
      console.log("Hiç şiir bulunamadı, örnek veriler oluşturuluyor (sadece development modunda)");
      const samplePoems = [
        {
          id: 1,
          title: "Yalnızlık Şiiri",
          content: "Gecenin sessizliğinde\nYalnızlık çöker üzerime\nKaranlık bir örtü gibi\nSarar tüm benliğimi",
          likes: 42,
          views: 120,
          coverImage: null,
          tags: ["yalnızlık", "gece", "sessizlik"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: "sample-1",
            name: "Sema Yıldız",
            image: null
          }
        },
        {
          id: 2,
          title: "Deniz Kokusu",
          content: "Dalganın sesi kulağımda\nTuzlu su damlalarının tadı dudaklarımda\nDenizin kokusu her nefeste\nÖzgürlük gibiydi o an, hiçbir şey düşünmeden",
          likes: 35,
          views: 98,
          coverImage: null,
          tags: ["deniz", "özgürlük", "dalga"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: "sample-2",
            name: "Deniz Akgül",
            image: null
          }
        },
        {
          id: 3,
          title: "Sonbahar Yaprakları",
          content: "Sararan yapraklar düşüyor\nSonbaharın hüznü yayılıyor\nRüzgarın her esişinde\nGeçmişin anıları savrulup gidiyor",
          likes: 28,
          views: 87,
          coverImage: null,
          tags: ["sonbahar", "hüzün", "anılar"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: "sample-3",
            name: "Ahmet Yılmaz",
            image: null
          }
        }
      ];
      
      return NextResponse.json({ 
        success: true, 
        data: samplePoems.slice(0, limit),
        note: "Sample data provided as no real poems were found"
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: trendingPoems 
    });

  } catch (error) {
    console.error("Trend şiirleri getirilirken hata:", error);
    return NextResponse.json(
      { success: false, message: "Şiirler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 