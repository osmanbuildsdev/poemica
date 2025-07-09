"use client";

import { useState, useEffect } from "react";
import { FiHeart, FiUser, FiBookmark, FiTrendingUp, FiHeadphones } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserPreferences } from "@/lib/userPreferences";


type TagPillProps = {
  tag: string;
  color: "blue" | "purple" | "green" | "amber" | "pink" | "gray";
};

function TagPill({ tag, color }: TagPillProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  

  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    green: "bg-green-50 text-green-700 hover:bg-green-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    pink: "bg-pink-50 text-pink-700 hover:bg-pink-100",
    gray: "bg-gray-50 text-gray-700 hover:bg-gray-100"
  };
  
  const handleTagClick = () => {
    setIsLoading(true);
    router.push(`/dashboard?tag=${tag}`);
    setTimeout(() => setIsLoading(false), 500);
  };
  
  return (
    <button
      onClick={handleTagClick}
      disabled={isLoading}
      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition ${colorClasses[color]} ${isLoading ? 'opacity-50' : ''}`}
    >
      {isLoading ? "..." : `#${tag}`}
    </button>
  );
}

export default function Sidebar() {
  const [recommendedPoems, setRecommendedPoems] = useState<any[]>([]);
  const [mostRecommended, setMostRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<{
    favoriteTags: string[],
    recentlyViewed: number[],
    interactionHistory: Record<string, number>
  }>({
    favoriteTags: [],
    recentlyViewed: [],
    interactionHistory: {}
  });
  

  useEffect(() => {
    try {
      const preferences = getUserPreferences();
      

      setUserPreferences({

        favoriteTags: Object.entries(preferences.favoriteTags || {})
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([tag]) => tag),

        recentlyViewed: (preferences.recentlyViewed || [])
          .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
          .filter(id => !isNaN(id)),

        interactionHistory: preferences.interactionHistory || {}
      });
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  }, []);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {

        let recommendedUrl = "/api/poems/recommended";
        if (userPreferences.favoriteTags.length > 0) {
          const tagsParam = userPreferences.favoriteTags.slice(0, 3).join(',');
          recommendedUrl += `?preferredTags=${tagsParam}`;
        }
        

        const [recommendedRes, mostRecommendedRes] = await Promise.all([
          fetch(recommendedUrl),
          fetch("/api/poems/most-recommended")
        ]);
        
        if (!recommendedRes.ok || !mostRecommendedRes.ok) {
          throw new Error("One or more API requests failed");
        }
        
        const recommendedData = await recommendedRes.json();
        const mostRecommendedData = await mostRecommendedRes.json();
        


        

        let personalizedRecommendations = recommendedData.data || [];
        


        

        if (userPreferences.favoriteTags.length > 0 && personalizedRecommendations.length > 0) {
          personalizedRecommendations = personalizedRecommendations.sort((a: any, b: any) => {
            const aMatchCount = a.tags ? a.tags.filter((tag: string) => 
              userPreferences.favoriteTags.includes(tag)).length : 0;
            const bMatchCount = b.tags ? b.tags.filter((tag: string) => 
              userPreferences.favoriteTags.includes(tag)).length : 0;
            return bMatchCount - aMatchCount;
          });
        }
        

        let popularPoems = mostRecommendedData.data || [];
        if (userPreferences.recentlyViewed.length > 0) {
          popularPoems = popularPoems.filter((poem: any) => 
            !userPreferences.recentlyViewed.includes(poem.id)
          );
        }
        
        setRecommendedPoems(personalizedRecommendations);
        setMostRecommended(popularPoems);
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        setError("Şiirler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userPreferences]);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100">
      {/* Sidebar Başlık */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Şiirler</h3>
      </div>
      
      {/* Hızlı Erişim Linkleri */}
      <div className="p-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Hızlı Erişim</div>
        <div className="grid grid-cols-1 gap-2">
          <Link href="/poems/trending" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group">
            <FiTrendingUp className="text-blue-500 group-hover:text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Trend</span>
          </Link>
        </div>
      </div>
      
      {/* Trend Etiketler */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Trend Etiketler</div>
        <div className="flex flex-wrap gap-2">
          <TagPill tag="aşk" color="blue" />
          <TagPill tag="hayat" color="purple" />
          <TagPill tag="doğa" color="green" />
          <TagPill tag="özlem" color="amber" />
          <TagPill tag="umut" color="pink" />
        </div>
      </div>

      {/* Önerilen Şiirler */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kişiselleştirilmiş Öneriler</div>
            <div className="text-xs text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Sizin için
            </div>
          </div>
          <div className="space-y-3">
            {error ? (
              <div className="text-center text-red-400 py-4 text-sm">{error}</div>
            ) : loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendedPoems.length > 0 ? (
              recommendedPoems.slice(0, 3).map((poem) => {

                let recommendationReason = '';
                if (poem.tags && poem.tags.some((tag: string) => userPreferences.favoriteTags.includes(tag))) {
                  recommendationReason = 'Beğenebilirsiniz';
                } else if (poem.author && userPreferences.interactionHistory?.[`author_${poem.author.id}`]) {
                  recommendationReason = 'Takip ettiğiniz şairden';
                } else {
                  recommendationReason = 'Sizin için seçtik';
                }
                
                return (
                  <Link
                    key={poem.id}
                    href={`/poems/${poem.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-blue-50 transition group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                      {poem.coverImage ? (
                        <Image
                          src={poem.coverImage}
                          alt={poem.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                          <FiHeadphones className="text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {poem.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{poem.author?.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                          {recommendationReason}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm mb-2">Henüz öneri yok</div>
                <Link href="/poems/trending" className="text-xs text-blue-600 hover:underline">
                  Trend şiirlere göz at →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Popüler Şiirler */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Popüler Şiirler</div>
            <div className="text-xs text-gray-400 flex items-center">
              <FiHeart className="h-3 w-3 mr-1" />
              Trend
            </div>
          </div>
          <div className="space-y-3">
            {error ? (
              <div className="text-center text-red-400 py-4 text-sm">{error}</div>
            ) : loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mostRecommended.length > 0 ? (
              mostRecommended.slice(0, 2).map((poem) => {

                const popularityScore = poem.likes > 50 ? 'Çok Popüler' : 
                                       poem.likes > 20 ? 'Yükselen' : 'Yeni Trend';
                                       
                return (
                  <Link
                    key={poem.id}
                    href={`/poems/${poem.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-pink-100">
                      {poem.coverImage ? (
                        <Image
                          src={poem.coverImage}
                          alt={poem.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                          <FiHeart className="text-pink-400" />
                        </div>
                      )}
                      {/* Hot indicator for very popular poems */}
                      {poem.likes > 50 && (
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-[8px] px-1 font-bold">
                          HOT
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-pink-700">
                        {poem.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <FiHeart className="w-3 h-3 text-pink-500" />
                          <span className="text-xs text-pink-600 font-medium">{poem.likes || 0}</span>
                        </div>
                        <span className="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-sm">
                          {popularityScore}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm mb-2">Henüz popüler şiir yok</div>
                <Link href="/create-poem" className="text-xs text-pink-600 hover:underline">
                  İlk şiirinizi oluşturun →
                </Link>
              </div>
            )}
            
            <Link href="/poems/trending" className="text-xs text-pink-600 hover:underline block text-center mt-2">
              Daha fazla göster →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Alt Bilgiler */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
        <Link href="/help" className="hover:text-blue-600 transition">Yardım</Link>
        {" • "}
        <Link href="/about" className="hover:text-blue-600 transition">Hakkında</Link>
        {" • "}
        <Link href="/privacy" className="hover:text-blue-600 transition">Gizlilik</Link>
      </div>
    </div>
  );
}