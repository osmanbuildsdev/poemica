import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, poems, follows } from "@/db/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";


const demoUsers = [
  {
    id: "user1",
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    password: "password123",
    image: "",
    bio: "Şiir hayatımın vazgeçilmez bir parçası. Genellikle doğa ve insan ilişkilerini konu alırım."
  },
  {
    id: "user2",
    name: "Zeynep Kaya",
    email: "zeynep@example.com",
    password: "password123",
    image: "",
    bio: "Duygularımı şiirlerle ifade etmeyi seviyorum. Aşk ve özlem temalı şiirler yazıyorum."
  },
  {
    id: "user3",
    name: "Mehmet Demir",
    email: "mehmet@example.com",
    password: "password123",
    image: "",
    bio: "Felsefe okumaları yapan ve düşüncelerini şiirlerle aktaran bir yazarım."
  },
  {
    id: "user4",
    name: "Ayşe Yıldız",
    email: "ayse@example.com",
    password: "password123",
    image: "",
    bio: "Hayatın içinden kesitleri şiirlerimde yansıtmaya çalışıyorum."
  },
  {
    id: "user5",
    name: "Can Öztürk",
    email: "can@example.com", 
    password: "password123",
    image: "",
    bio: "Modern şiir akımlarını takip eden, deneysel çalışmalar yapan bir şairim."
  }
];


const demoPoems = [
  {
    title: "Sonbahar Düşünceleri",
    content: "Yapraklar dökülür, rüzgar eser\nHüzün dolar içime, mevsim sonbahar\nBir başka güzeldir bu mevsim\nYağmur damlaları camda, çay elimde sıcak.",
    authorId: "user1",
    tags: ["sonbahar", "hüzün", "şiir"],
    likes: 76,
    views: 321
  },
  {
    title: "Deniz Kokusu",
    content: "Martılar süzülür masmavi gökyüzünde\nDenizin tuzlu kokusu sarar etrafı\nDalgalar vurur kıyıya usul usul\nBir huzur kaplar içimi, dinlerim denizin sesini.",
    authorId: "user2",
    tags: ["deniz", "huzur", "martı"],
    likes: 108,
    views: 492
  },
  {
    title: "Gece Düşleri",
    content: "Yıldızlar parıldar gecenin koynunda\nAy ışığı süzülür odama sessizce\nDüşlerim uçuşur karanlıkta\nHayaller kurarım sabaha dek.",
    authorId: "user3",
    tags: ["gece", "düş", "yıldız"],
    likes: 65,
    views: 280
  },
  {
    title: "Hayat Yolculuğu",
    content: "Uzun bir yoldur hayat\nİniş çıkışlarla dolu\nKimi zaman yorulursun\nAma devam etmelisin yoluna.",
    authorId: "user4",
    tags: ["hayat", "yolculuk", "felsefe"],
    likes: 125,
    views: 528
  },
  {
    title: "Aşk Üzerine",
    content: "Kalbimde bir sızıdır aşk\nBazen mutluluk, bazen acı\nYakar içimi, söndürür ateşimi\nAma vazgeçilmez bir tutkudur her daim.",
    authorId: "user5",
    tags: ["aşk", "tutku", "duygu"],
    likes: 215,
    views: 745
  },
  {
    title: "Şehir Gürültüsü",
    content: "Kalabalık sokaklar, yüksek binalar\nKoşturan insanlar, çalan kornalar\nŞehrin ritmi sardı her yanı\nUnutuldu doğanın huzuru.",
    authorId: "user2",
    tags: ["şehir", "gürültü", "modern yaşam"],
    likes: 42,
    views: 183
  },
  {
    title: "Yağmur Damlası",
    content: "Gökyüzünden düşer damlalar\nYeryüzüne ulaşır sessizce\nHer biri bir hikaye anlatır\nYalnızca dinlemeyi bilene.",
    authorId: "user1",
    tags: ["yağmur", "doğa", "huzur"],
    likes: 93,
    views: 347
  },
  {
    title: "Zamanın İzinde",
    content: "Zaman akıp gider durduramadan\nGeçmiş uzaklaşır, gelecek belirsiz\nŞu an elimizde tuttuğumuz tek gerçek\nDeğerini bil, anın tadını çıkar.",
    authorId: "user3",
    tags: ["zaman", "felsefe", "yaşam"],
    likes: 88,
    views: 314
  },
  {
    title: "Özgürlük",
    content: "Rüzgar gibi esmek istiyorum\nKuşlar gibi kanat çırpmak gökyüzünde\nZincirlerden arınmış, sınırlardan uzak\nÖzgürlük içimde büyüyen bir çığlık.",
    authorId: "user4",
    tags: ["özgürlük", "doğa", "yaşam"],
    likes: 154,
    views: 478
  },
  {
    title: "Sessiz Çığlık",
    content: "İçimde büyüyen fırtınalar\nDışarıda sakin bir yüz maskesi\nKimse duymaz içimdeki çığlıkları\nSessizliğin en çok duyulduğu zamandır.",
    authorId: "user5",
    tags: ["duygu", "sessizlik", "içsel yolculuk"],
    likes: 176,
    views: 524
  }
];


const demoFollows = [
  { followerId: "user1", followingId: "user2" },
  { followerId: "user1", followingId: "user3" },
  { followerId: "user2", followingId: "user1" },
  { followerId: "user2", followingId: "user5" },
  { followerId: "user3", followingId: "user1" },
  { followerId: "user3", followingId: "user4" },
  { followerId: "user4", followingId: "user2" },
  { followerId: "user4", followingId: "user5" },
  { followerId: "user5", followingId: "user1" },
  { followerId: "user5", followingId: "user3" }
];

export async function GET() {
  // Demo verisi tüm tabloları sıfırlar; production'da asla çalışmamalı.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {

    await db.delete(poems);
    await db.delete(follows);
    await db.delete(users);


    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.insert(users).values({
        ...user,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }


    for (const poem of demoPoems) {
      await db.insert(poems).values({
        ...poem,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }


    for (const follow of demoFollows) {
      await db.insert(follows).values({
        ...follow,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Veritabanı başarıyla dolduruldu.",
      data: {
        users: demoUsers.length,
        poems: demoPoems.length,
        follows: demoFollows.length
      }
    });
  } catch (error) {
    console.error("Veritabanı seed hatası:", error);
    return NextResponse.json(
      { success: false, message: "Veritabanı doldurulurken hata oluştu.", error },
      { status: 500 }
    );
  }
} 