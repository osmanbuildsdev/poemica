"use client";

import { useState, useEffect } from "react";
import { FiHeart, FiUser, FiThumbsUp, FiBookmark, FiTrendingUp, FiHeadphones, FiMenu, FiX, FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { getUserPreferences, UserPreferences } from "@/lib/userPreferences";

type User = {
  id: string;
  name: string;
  email?: string;
  image?: string;
};

type Poem = {
  id: number;
  title: string;
  content: string;
  coverImage?: string;
  authorId: string;
  author: User;
  tags?: string[];
  likes: number;
  views: number;
  createdAt: string;
};

export default function FeedSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedByFollowing, setRecommendedByFollowing] = useState<any[]>([]);
  const [mostRecommendedPoems, setMostRecommendedPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {

        let preferences;
        try {
          preferences = getUserPreferences();
        } catch (e) {
          preferences = { lastSidebarRefresh: 0 };
        }


        const now = Date.now();
        const shouldRefresh = !preferences.lastSidebarRefresh || (now - preferences.lastSidebarRefresh) > 5 * 60 * 1000;
        

        const recommendedByFollowingRes = await fetch("/api/poems/recommended-by-following", {
          credentials: 'include',
          cache: shouldRefresh ? 'no-store' : 'force-cache'
        });
        

        const mostRecommendedRes = await fetch("/api/poems/most-recommended", {
          cache: shouldRefresh ? 'no-store' : 'force-cache'
        });
        

        if (!recommendedByFollowingRes.ok) {
          console.warn("Takip ettiklerinin tavsiyeleri yüklenemedi:", recommendedByFollowingRes.status);

        }
        
        if (!mostRecommendedRes.ok) {
          throw new Error(`En çok tavsiye edilenler yüklenemedi: ${mostRecommendedRes.status}`);
        }
        

        if (recommendedByFollowingRes.ok) {
          const recommendedByFollowingData = await recommendedByFollowingRes.json();
          
          if (recommendedByFollowingData.success && recommendedByFollowingData.data) {
            setRecommendedByFollowing(recommendedByFollowingData.data);

          }
        }
        
        const mostRecommendedData = await mostRecommendedRes.json();
        
        if (mostRecommendedData.success && mostRecommendedData.data) {
          setMostRecommendedPoems(mostRecommendedData.data);

        }
        

        if (shouldRefresh) {
          try {
            const updatedPreferences = { ...preferences, lastSidebarRefresh: now };
            localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
          } catch (e) {
            console.warn('Kullanıcı tercihleri kaydedilemedi', e);
          }
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
        setError("Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
    const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button - Always visible */}      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg shadow-lg transition-all z-40"
        aria-label={isOpen ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç"}
      >
        {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Sidebar */}      <aside 
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out z-50 w-80 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Keşfet</h3>
          <button 
            onClick={closeSidebar}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            aria-label="Kapat"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Takip Ettiklerimin Tavsiyeleri */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Takip Ettiklerimin Tavsiyeleri</h4>
              <div className="text-xs text-blue-500 flex items-center">
                <FiThumbsUp className="h-3 w-3 mr-1" />
                Tavsiyeler
              </div>
            </div>
            
            {error ? (
              <div className="text-center text-red-400 py-4 text-sm">{error}</div>
            ) : loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendedByFollowing.length > 0 ? (
              <div className="space-y-3">
                {recommendedByFollowing.slice(0, 3).map((poem) => (
                  <Link
                    key={poem.id}
                    href={`/poems/${poem.id}`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition group"
                  >
                    {poem.author?.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={poem.author.image}
                          alt={poem.author.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium">{poem.author?.name || "İsimsiz Yazar"} tavsiye etti:</p>
                      <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 truncate">{poem.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center text-xs text-gray-500">
                          <FiThumbsUp className="w-3 h-3 mr-1 text-blue-400" />
                          {poem.recommends || 0}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <FiHeart className="w-3 h-3 mr-1 text-pink-400" />
                          {poem.likes || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center pt-2">
                  <Link href="/dashboard" className="text-xs text-blue-600 hover:underline inline-flex items-center">
                    Tümünü gör <FiChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Henüz tavsiye edilen şiir yok</p>
                <Link href="/explore" className="text-xs text-blue-600 hover:underline block mt-2">
                  Şairleri keşfet ve takip et →
                </Link>
              </div>
            )}
          </section>
          
          {/* En Çok Tavsiye Edilenler */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">En Çok Tavsiye Edilenler</h4>
              <div className="text-xs text-pink-500 flex items-center">
                <FiTrendingUp className="h-3 w-3 mr-1" />
                Popüler
              </div>
            </div>
            
            {error ? (
              <div className="text-center text-red-400 py-4 text-sm">{error}</div>
            ) : loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mostRecommendedPoems.length > 0 ? (
              <div className="space-y-3">
                {mostRecommendedPoems.slice(0, 5).map((poem) => {

                  const recommendCount = poem.recommends || 0;
                  const popularityLabel = recommendCount > 20 ? 'Çok Tavsiye Edilen' : 
                                      recommendCount > 10 ? 'Yükselen' : 'Yeni Tavsiye';
                  
                  return (
                    <Link
                      key={poem.id}
                      href={`/poems/${poem.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition group"
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
                            <FiThumbsUp className="text-pink-400" />
                          </div>
                        )}
                        {/* Hot indicator for very recommended poems */}
                        {recommendCount > 15 && (
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
                            <FiThumbsUp className="w-3 h-3 text-pink-500" />
                            <span className="text-xs text-pink-600 font-medium">{recommendCount}</span>
                          </div>
                          <span className="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-sm">
                            {popularityLabel}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <div className="text-center pt-2">
                  <Link href="/poems/trending" className="text-xs text-pink-600 hover:underline inline-flex items-center">
                    Daha fazla göster <FiChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Henüz tavsiye edilen popüler şiir yok</p>
                <Link href="/create-poem" className="text-xs text-pink-600 hover:underline block mt-2">
                  İlk şiirinizi oluşturun →
                </Link>
              </div>
            )}
          </section>
          
          {/* Help Section */}
          <section className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">İpuçları</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <p className="flex items-start gap-2">
                <FiThumbsUp className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Beğendiğiniz şiirleri <strong className="text-blue-600">tavsiye edin</strong> ve koleksiyonunuza ekleyin.</span>
              </p>
              <p className="flex items-start gap-2">
                <FiUser className="text-blue-500 mt-0.5 flex-shrink-0" />
                <span>Beğendiğiniz şairleri <strong className="text-blue-600">takip edin</strong> ve yeni içeriklerinden haberdar olun.</span>
              </p>
              <p className="flex items-start gap-2">
                <FiHeart className="text-pink-500 mt-0.5 flex-shrink-0" />
                <span>Şiirleri <strong className="text-pink-600">beğenin</strong> ve yazarlara destek olun.</span>
              </p>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
          <Link href="/help" className="hover:text-blue-600 transition">Yardım</Link>
          {" • "}
          <Link href="/about" className="hover:text-blue-600 transition">Hakkında</Link>
          {" • "}
          <Link href="/privacy" className="hover:text-blue-600 transition">Gizlilik</Link>
        </div>
      </aside>
    </>
  );
}
