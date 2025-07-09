"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStatus } from "@/lib/hooks";
import FeedSidebar from "@/components/layout/FeedSidebar";
import PoemActions from "@/components/poems/PoemActions";
import ProfileAvatar from "@/components/ProfileAvatar";
import { FiUser, FiCalendar, FiHeart, FiThumbsUp, FiEye, FiTrendingUp } from "react-icons/fi";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
};

type Poem = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  author: User;
  tags: string[];
  likes: number;
  views: number;
  recommends?: number;
  createdAt: string;
  updatedAt: string;
};

export default function Feed() {
  const { session, isAuthenticated } = useAuthStatus();
  const user = isAuthenticated ? session?.user : null;  const [followingPoems, setFollowingPoems] = useState<Poem[]>([]);
  const [recommendedPoems, setRecommendedPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    async function fetchUserData() {
      try {
        if (user) {

          fetchFollowingPoems(user.id);
        }

        fetchRecommendedPoems();
      } catch (error) {
        console.error("Kullanıcı bilgileri alınamadı:", error);

        fetchRecommendedPoems();
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();

    intervalId = setInterval(() => {
      fetchRecommendedPoems();
    }, 60 * 60 * 1000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [user]);

  async function fetchFollowingPoems(userId: string, currentPage = 1, append = false) {
    try {
      setLoadingMore(currentPage > 1);
      
      const response = await fetch(`/api/poems/feed?userId=${userId}&page=${currentPage}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setFollowingPoems(prev => [...prev, ...data.data]);
        } else {
          setFollowingPoems(data.data);
        }
        

        setHasMore(data.pagination?.hasNextPage || false);
      } else {
        console.error("Takip edilen şiirler getirilemedi:", data.message);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Şiirler yüklenirken hata:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }
  

  const loadMorePoems = () => {
    if (loadingMore || !hasMore || !user) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFollowingPoems(user.id, nextPage, true);
  }



  async function fetchRecommendedPoems() {
    try {
      let url = "/api/poems/recommended?limit=5";
      if (user) {
        url += `&userId=${user.id}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setRecommendedPoems(data.data);
      } else {
        setRecommendedPoems([]);
        console.error("Senin için şiirler getirilemedi:", data.message);
      }
    } catch (error) {
      setRecommendedPoems([]);
      console.error("Senin için şiirler yüklenirken hata:", error);
    }
  }


  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }


  function formatPoemContent(content: string) {
    return content
      .split('\n')
      .map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ));
  }  return (
    <div className="min-h-screen bg-gray-50 relative flex">
      {/* FeedSidebar bileşeni ekleniyor */}
      <FeedSidebar />
      
      {/* Ana içerik - sabit genişlikte ve ortada */}
      <main className="w-full max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Akış</h1>
          <p className="text-gray-500 mt-2">Takip ettiğiniz kişilerin son şiirleri burada görünür.</p>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {user ? (
              <>                {followingPoems.length > 0 ? (
                  <div className="space-y-8">
                    {followingPoems.map((poem) => (
                      <article key={poem.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition relative">
                        {/* PoemActions component for saving/archiving */}
                        <div className="absolute top-4 right-4">
                          <PoemActions poemId={poem.id} variant="icon" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-5">
                          <Link 
                            href={`/profile/${poem.author.id}`} 
                            className="block group"
                          >
                            <ProfileAvatar user={poem.author} size="md" />
                          </Link>
                          <div>
                            <Link 
                              href={`/profile/${poem.author.id}`}
                              className="font-medium text-gray-900 hover:text-blue-700 transition"
                            >
                              {poem.author.name}
                            </Link>
                            <div className="flex items-center text-gray-500 text-sm">
                              <FiCalendar className="mr-1" size={12} />
                              {formatDate(poem.createdAt)}
                            </div>
                          </div>
                        </div>

                        <Link 
                          href={`/poems/${poem.id}`}
                          className="block group"
                        >
                          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition">
                            {poem.title}
                          </h2>
                          <div className="prose prose-sm text-gray-700 mb-4 max-h-32 overflow-hidden relative">
                            {formatPoemContent(poem.content)}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                          </div>
                        </Link>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-gray-500 text-sm">
                              <FiHeart className="mr-1 text-pink-500" />
                              {poem.likes}
                            </span>
                            <span className="flex items-center text-gray-500 text-sm">
                              <FiThumbsUp className="mr-1 text-blue-500" />
                              {poem.recommends || 0}
                            </span>
                            <span className="flex items-center text-gray-500 text-sm">
                              <FiEye className="mr-1" />
                              {poem.views}
                            </span>
                          </div>
                          <Link
                            href={`/poems/${poem.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Devamını oku →
                          </Link>
                        </div>
                      </article>
                    ))}
                    
                    {/* Load more button */}
                    {hasMore && (
                      <div className="text-center py-4">
                        <button
                          onClick={loadMorePoems}
                          className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md transition flex items-center justify-center mx-auto"
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Yükleniyor...
                            </>
                          ) : (
                            "Daha fazla yükle"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Henüz takip ettiğiniz kişilerden şiir yok</h2>
                    <p className="text-gray-500 mb-6">Şairleri takip ederek akışınızı kişiselleştirebilirsiniz.</p>
                    <Link 
                      href="/explore"
                      className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Şairleri keşfedin
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Akışınızı görmek için giriş yapın</h2>
                <p className="text-gray-500 mb-6">Giriş yaparak takip ettiğiniz şairlerin şiirlerini görebilirsiniz.</p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    href="/login"
                    className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/register"
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    Üye Ol
                  </Link>
                </div>
              </div>
            )}

            {/* Senin için Bölümü */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiTrendingUp className="mr-2 text-pink-500" />
                Senin için
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedPoems.length > 0 ? recommendedPoems.map((poem) => (
                  <Link 
                    key={poem.id}
                    href={`/poems/${poem.id}`}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition"
                  >
                    <h3 className="font-medium text-gray-900">{poem.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{poem.author.name}</p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="flex items-center text-pink-600 mr-3">
                        <FiHeart className="mr-1" />
                        {poem.likes}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <FiEye className="mr-1" />
                        {poem.views}
                      </span>
                    </div>
                  </Link>
                )) : (
                  <div className="text-gray-500 col-span-2">Senin için önerilen şiir bulunamadı.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}