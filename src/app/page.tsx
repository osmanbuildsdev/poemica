"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Author {
  id: string;
  name: string;
  image: string | null;
}

interface FeaturedPoem {
  id: number;
  title: string;
  content: string;
  likes: number;
  views: number;
  coverImage?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  author: Author;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [featuredPoems, setFeaturedPoems] = useState<FeaturedPoem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (status === "authenticated" && session) {
      router.replace("/feed");
      return;
    }
    

    if (status === "unauthenticated") {
      fetchFeaturedPoems();
    }
  }, [status, session, router]);

  async function fetchFeaturedPoems() {
    try {
      setIsLoading(true);
      setError(null);


      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/poems/trending?limit=3', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {

        const formattedPoems = data.data.map((poem: any) => ({
          id: poem.id,
          title: poem.title,
          content: poem.content,
          likes: poem.likes || 0,
          views: poem.views || 0,
          coverImage: poem.coverImage,
          tags: Array.isArray(poem.tags) ? poem.tags : [],
          createdAt: poem.createdAt,
          updatedAt: poem.updatedAt,
          author: {
            id: poem.author?.id || 'unknown',
            name: poem.author?.name || 'İsimsiz Şair',
            image: poem.author?.image || null
          }
        }));

        setFeaturedPoems(formattedPoems);

        console.log("Çekilen şiirler:", formattedPoems);
      } else {
        setError("Şiirler yüklenirken beklenmeyen bir yanıt alındı");
        console.error('API başarılı yanıt döndürmedi:', data);
      }
    } catch (error: any) {
      console.error('Öne çıkan şiirler yüklenirken hata:', error);

      if (error.name === 'AbortError') {
        setError("İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.");
      } else {
        setError(error.message || "Şiirler yüklenirken bir hata oluştu");
      }
    } finally {
      setIsLoading(false);
    }
  }


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-100 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Image 
            src="/poemica-logo.png" 
            alt="Poemica Logo" 
            width={120} 
            height={40} 
            className="mb-5 opacity-70 h-10 w-auto" 
          />
          <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-100 flex flex-col">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center text-center">
        <Image 
          src="/poemica-logo.png" 
          alt="Poemica Logo" 
          width={200} 
          height={80} 
          className="mb-8 h-16 w-auto"
          priority
        />
        <p className="text-2xl text-gray-700 max-w-2xl mb-8">
          Şiirlerin buluşma noktası. Kendi şiirlerini paylaş, başkalarının eserlerini keşfet ve ilham dolu bir topluluğun parçası ol.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/explore" className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition">
            Keşfet
          </Link>
          {status === "unauthenticated" && (
            <>
              <Link href="/login" className="px-8 py-3 rounded-lg bg-white border border-indigo-600 text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition">
                Giriş Yap
              </Link>
              <Link href="/register" className="px-8 py-3 rounded-lg bg-violet-600 text-white font-semibold shadow hover:bg-violet-700 transition">
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
          <Image src="/file.svg" alt="Şiir Paylaş" width={40} height={40} className="mb-3" />
          <h3 className="text-lg font-bold text-indigo-700 mb-1">Şiir Paylaş</h3>
          <p className="text-gray-500 text-sm text-center">Kendi şiirlerini kolayca paylaş, sesini duyur.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
          <Image src="/globe.svg" alt="Keşfet" width={40} height={40} className="mb-3" />
          <h3 className="text-lg font-bold text-indigo-700 mb-1">Keşfet</h3>
          <p className="text-gray-500 text-sm text-center">Binlerce şiir ve şairi keşfet, ilham al.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
          <Image src="/window.svg" alt="Koleksiyon Oluştur" width={40} height={40} className="mb-3" />
          <h3 className="text-lg font-bold text-indigo-700 mb-1">Koleksiyonlar</h3>
          <p className="text-gray-500 text-sm text-center">Favori şiirlerini koleksiyonlara ekle, düzenle.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
          <Image src="/vercel.svg" alt="Topluluk" width={40} height={40} className="mb-3" />
          <h3 className="text-lg font-bold text-indigo-700 mb-1">Topluluk</h3>
          <p className="text-gray-500 text-sm text-center">Şairlerle iletişim kur, yorum yap, beğen ve paylaş.</p>
        </div>
      </section>

      {/* HAKKINDA / MANIFESTO */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Neden Poemica?</h2>
        <p className="text-lg text-gray-600 mb-6">
          Poemica, şiir severler ve şairler için modern, güvenli ve ilham verici bir platformdur. Amacımız, herkesin duygularını özgürce ifade edebileceği, eserlerini paylaşabileceği ve yeni ilhamlar bulabileceği bir topluluk oluşturmak.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <div className="flex-1 bg-indigo-50 rounded-lg p-6">
            <h3 className="font-semibold text-indigo-800 mb-2">Güçlü Topluluk</h3>
            <p className="text-gray-600 text-sm">Yorumlar, beğeniler ve takip sistemiyle aktif bir şiir topluluğu.</p>
          </div>
          <div className="flex-1 bg-violet-50 rounded-lg p-6">
            <h3 className="font-semibold text-violet-800 mb-2">Modern Tasarım</h3>
            <p className="text-gray-600 text-sm">Kullanıcı dostu, hızlı ve mobil uyumlu arayüz.</p>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-10">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {status === "unauthenticated" && (
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
              <span className="text-3xl font-bold text-indigo-600 mb-2">1</span>
              <h4 className="font-semibold mb-1">Kayıt Ol</h4>
              <p className="text-gray-500 text-sm text-center">Hızlıca üye ol, profilini oluştur.</p>
            </div>
          )}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <span className="text-3xl font-bold text-indigo-600 mb-2">{status === "unauthenticated" ? "2" : "1"}</span>
            <h4 className="font-semibold mb-1">Şiir Paylaş</h4>
            <p className="text-gray-500 text-sm text-center">Duygularını ve eserlerini toplulukla paylaş.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-gray-100">
            <span className="text-3xl font-bold text-indigo-600 mb-2">{status === "unauthenticated" ? "3" : "2"}</span>
            <h4 className="font-semibold mb-1">Keşfet & Etkileşim</h4>
            <p className="text-gray-500 text-sm text-center">Diğer şiirleri keşfet, beğen, yorum yap ve koleksiyonuna ekle.</p>
          </div>
        </div>
      </section>

      {/* TOPLULUK / İSTATİSTİK */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Poemica Topluluğu</h2>
        <p className="text-lg text-gray-600 mb-8">Binlerce şiir, yüzlerce aktif şair ve her gün büyüyen bir ilham kaynağı.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <div className="flex-1 bg-white rounded-lg p-6 border border-gray-100">
            <span className="block text-2xl font-bold text-indigo-600 mb-1">10.000+</span>
            <span className="text-gray-500">Paylaşılan Şiir</span>
          </div>
          <div className="flex-1 bg-white rounded-lg p-6 border border-gray-100">
            <span className="block text-2xl font-bold text-violet-600 mb-1">1.000+</span>
            <span className="text-gray-500">Aktif Şair</span>
          </div>
          <div className="flex-1 bg-white rounded-lg p-6 border border-gray-100">
            <span className="block text-2xl font-bold text-indigo-600 mb-1">100.000+</span>
            <span className="text-gray-500">Yorum & Beğeni</span>
          </div>
        </div>
      </section>

      {/* ÖNE ÇIKAN ŞİİRLER */}
      <section className="max-w-5xl mx-auto px-4 py-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">Öne Çıkan Şiirler</h2>
            <p className="text-gray-600">Topluluğumuzun en çok beğeni alan eserleri</p>
          </div>
          
          <Link href="/poems/trending" className="mt-4 md:mt-0 px-6 py-2 rounded-lg bg-black bg-opacity-70 text-white font-semibold shadow hover:bg-gray-900 transition inline-flex items-center gap-2">
            <span>Tümünü Gör</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 border border-gray-100 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-200 h-6 w-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" x2="12" y1="8" y2="12"/>
                <line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Şiirler yüklenemedi</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Yeniden Dene
            </button>
          </div>
        ) : featuredPoems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPoems.map((poem) => (
              <div key={poem.id} className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 p-6 border border-gray-100 group">
                {poem.coverImage && (
                  <div className="mb-3 h-40 overflow-hidden rounded-lg">
                    <Image 
                      src={poem.coverImage.startsWith('/') ? poem.coverImage : `/uploads/${poem.coverImage}`} 
                      alt={poem.title}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {

                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/file.svg';
                      }}
                    />
                  </div>
                )}
                <Link href={`/poems/${poem.id}`} className="block group-hover:translate-x-1 transition-transform duration-300">
                  <h3 className="font-semibold text-gray-800 mb-2 hover:text-indigo-600 transition line-clamp-1 text-lg">{poem.title}</h3>
                </Link>
                <p className="italic text-gray-600 mb-4 text-sm line-clamp-4">
                  {poem.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
                  {poem.content?.length > 150 ? '...' : ''}
                </p>
                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                  <Link href={`/profile/${poem.author.id}`} className="font-semibold text-gray-700 hover:text-indigo-600 transition flex items-center gap-2">
                    {poem.author.image ? (
                      <Image 
                        src={poem.author.image}
                        alt={poem.author.name || "Profil"}
                        width={24}
                        height={24}
                        className="rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                        {poem.author.name?.[0] || "U"}
                      </div>
                    )}
                    <span>{poem.author.name}</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {poem.likes}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {poem.views}
                    </span>
                  </div>
                </div>
                {poem.tags && Array.isArray(poem.tags) && poem.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {poem.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                    {poem.tags.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        +{poem.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz öne çıkan şiir bulunmuyor</h3>
            <p className="text-gray-500 mb-6">İlk şiirini paylaş, topluluğumuzu canlandır ve ilham ver!</p>
            <Link href="/create-poem" className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow hover:shadow-lg transition inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>Şiir Oluştur</span>
            </Link>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link href="/explore" className="px-8 py-3 rounded-lg bg-black bg-opacity-70 text-white font-semibold shadow hover:bg-gray-900 transition inline-flex items-center gap-2">
            <span>Daha Fazla Şiir Keşfet</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m13 5 7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
      
      {/* SIKÇA SORULAN SORULAR */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-10">Sıkça Sorulan Sorular</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Poemica'ya üye olmak ücretsiz mi?</h3>
            <p className="text-gray-600">Evet, Poemica'ya üye olmak tamamen ücretsiz. Tüm temel özellikler herkes için erişilebilir durumda.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Paylaştığım şiirlerin telif hakları bana mı ait?</h3>
            <p className="text-gray-600">Evet, paylaştığınız şiirlerin telif hakları tamamen size aittir. Poemica sadece bir platform sağlar ve eserlerinizin haklarını ihlal etmez.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Şiirlerimi kimlerin görebileceğini sınırlayabilir miyim?</h3>
            <p className="text-gray-600">Evet, şiirlerinizi paylaşırken gizlilik ayarlarını belirleyebilirsiniz. İsterseniz sadece takipçilerinize özel veya tamamen gizli şiirler paylaşabilirsiniz.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Diğer şairlerin şiirlerini koleksiyonuma nasıl eklerim?</h3>
            <p className="text-gray-600">Beğendiğiniz bir şiiri okurken "Koleksiyona Ekle" butonuna tıklayabilir ve mevcut bir koleksiyona ekleyebilir veya yeni bir koleksiyon oluşturabilirsiniz.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-semibold">Poemica © {new Date().getFullYear()} - Şiirle Büyüyen Topluluk</p>
          <p className="text-sm mt-2 opacity-80">Birlikte yaz, paylaş, ilham al.</p>
        </div>
      </footer>
    </main>
  );
}
