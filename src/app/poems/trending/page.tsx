"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrendingUp, FiFilter, FiSearch, FiHeart, FiEye, FiMessageSquare, FiClock } from 'react-icons/fi';
import Image from 'next/image';

interface Poem {
  id: string | number;
  title: string;
  content: string;
  coverImage?: string | null;
  likes: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export default function TrendingPoemsPage() {
  const router = useRouter();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const poemsPerPage = 9;

  const fetchTrendingPoems = async (pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const limit = poemsPerPage;
      const offset = (pageNumber - 1) * poemsPerPage;
      const res = await fetch(`/api/poems/trending?limit=${limit}&offset=${offset}&timeFrame=${timeFrame}`);
      const data = await res.json();
      
      if (data.success) {
        const newPoems = data.data || [];
        

        if (newPoems.length < poemsPerPage) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
        if (isLoadMore) {
          setPoems(prevPoems => [...prevPoems, ...newPoems]);
        } else {
          setPoems(newPoems);
        }
      } else {
        console.error("Veri çekilemedi:", data.message);
      }
    } catch (error) {
      console.error("Trend şiirleri yüklenirken hata:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchTrendingPoems(1, false);
  }, [timeFrame]);
  

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrendingPoems(nextPage, true);
  };


  const filteredPoems = poems.filter(poem => 
    poem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    poem.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header with animation */}
        <div className="mb-10 text-center relative">
          <div className="inline-block relative">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Trend Şiirler
            </h1>
            <div className="absolute -top-6 -right-6 bg-pink-500/10 p-2 rounded-full animate-pulse">
              <FiTrendingUp className="text-3xl text-pink-500" />
            </div>
          </div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Okuyucular tarafından en çok beğenilen ve okunan şiirleri keşfedin
          </p>
        </div>

        {/* Filters and search bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şiir veya şair ara..."
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative inline-block text-left">
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="inline-flex justify-center w-full rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="weekly">Bu Hafta</option>
                <option value="daily">Bugün</option>
                <option value="monthly">Bu Ay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {loading ? (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-52 bg-gray-200 w-full"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPoems.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 text-gray-300">
                <FiSearch className="h-full w-full" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sonuç bulunamadı</h3>
              <p className="mt-1 text-gray-500">Aramanızla eşleşen hiçbir şiir bulunamadı.</p>
            </div>
          ) : (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">              {filteredPoems.map((poem) => {
                const handleClick = (e: React.MouseEvent) => {

                  if ((e.target as HTMLElement).closest('.author-link')) return;
                  router.push(`/poems/${poem.id}`);
                };

                return (
                  <div 
                    key={poem.id} 
                    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                    onClick={handleClick}
                  >
                    {poem.coverImage ? (
                      <div className="relative h-52 w-full overflow-hidden">
                        <Image
                          src={poem.coverImage}
                          alt={poem.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="h-52 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-4xl font-serif text-gray-500 italic">{poem.title.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Badge for top trending */}
                      {poems.indexOf(poem) < 3 && (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 mb-3">
                          <FiTrendingUp className="mr-1" /> {poems.indexOf(poem) === 0 ? "En Popüler" : `Top ${poems.indexOf(poem) + 1}`}
                        </div>
                      )}
                      
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {poem.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                        {poem.content}
                      </p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center">
                          {poem.author.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                              <Image
                                src={poem.author.image}
                                alt={poem.author.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-gray-500 font-medium">{poem.author.name.charAt(0)}</span>
                            </div>
                          )}
                          {/* Use onClick with stopPropagation to prevent triggering the parent click */}
                          <span 
                            className="author-link text-sm text-gray-700 hover:underline cursor-pointer"                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/profile/${poem.author.id}`);
                            }}
                          >
                            {poem.author.name}
                          </span>
                        </div>
                        
                        <div className="flex space-x-3 text-sm">
                          <div className="flex items-center text-rose-600">
                            <FiHeart className="w-4 h-4 mr-1" />
                            <span>{poem.likes}</span>
                          </div>
                          <div className="flex items-center text-blue-600">
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>{poem.views}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <div className="text-xs text-gray-400 flex items-center">
                          <FiClock className="mr-1 w-3 h-3" />
                          <span>{formatDate(poem.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
          {/* Pagination or Load More Button */}
        {!loading && filteredPoems.length > 0 && hasMore && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white 
                ${loadingMore ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </>
              ) : (
                'Daha Fazla Göster'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
