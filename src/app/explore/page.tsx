"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiSearch, FiFilter, FiHeart, FiEye, FiClock, FiTag, FiRefreshCw, 
  FiGrid, FiList, FiTrendingUp, FiCalendar, FiX, FiSliders
} from 'react-icons/fi';
import Image from 'next/image';
import ProfileAvatar from "@/components/ProfileAvatar";

interface Poem {
  id: string | number;
  title: string;
  content: string;
  coverImage?: string | null;
  likes: number;
  views: number;
  createdAt: string;
  tags?: string[];
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [popularTags, setPopularTags] = useState<{tag: string, count: number}[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const poemsPerPage = 9;
  const observer = useRef<IntersectionObserver | null>(null);


  const lastPoemElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !filterTag && !searchQuery) {
        handleLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, filterTag, searchQuery]);


  const fetchPoems = async (pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const limit = poemsPerPage;
      const offset = (pageNumber - 1) * poemsPerPage;
      const res = await fetch(`/api/poems?limit=${limit}&offset=${offset}&sortBy=${sortBy}`);
      const data = await res.json();
      
      if (data.success) {
        const newPoems = data.poems || [] as Poem[];
        

        if (newPoems.length < poemsPerPage) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
        if (isLoadMore) {
          setPoems(prevPoems => [...prevPoems, ...newPoems]);
        } else {
          setPoems(newPoems);
          

          const tags: {[key: string]: number} = {};
          newPoems.forEach((poem: Poem) => {
            if (poem.tags && Array.isArray(poem.tags)) {
              poem.tags.forEach((tag: string) => {
                tags[tag] = (tags[tag] || 0) + 1;
              });
            }
          });
          

          const sortedTags = Object.entries(tags)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
          
          setPopularTags(sortedTags);
        }
      } else {
        console.error("Şiirler yüklenemedi:", data.message);
      }
    } catch (error) {
      console.error("Şiirler yüklenirken hata:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPoems(1, false);
    

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);


  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPoems(nextPage, true);
  };
  

  useEffect(() => {
    let result = [...poems];
    

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(poem => 
        poem.title.toLowerCase().includes(query) || 
        poem.content.toLowerCase().includes(query) ||
        poem.author.name.toLowerCase().includes(query)
      );
    }
    

    if (filterTag) {
      result = result.filter(poem => 
        poem.tags && Array.isArray(poem.tags) && poem.tags.includes(filterTag)
      );
    }
    

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
    }
    
    setFilteredPoems(result);
  }, [poems, searchQuery, filterTag, sortBy]);
  

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
  

  const handlePoemClick = (e: React.MouseEvent, poemId: string | number) => {
    if ((e.target as HTMLElement).closest('.author-link') || 
        (e.target as HTMLElement).closest('.tag-chip')) {
      return;
    }
    router.push(`/poems/${poemId}`);
  };
  

  const handleTagClick = (tag: string) => {
    if (filterTag === tag) {
      setFilterTag(null);
    } else {
      setFilterTag(tag);
    }
  };


  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };


  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterTag(null);
    setSortBy('newest');
  };


  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
      const cards = document.querySelectorAll('.poem-card');
      
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.classList.add('is-hovered');
        });
        
        card.addEventListener('mouseleave', () => {
          card.classList.remove('is-hovered');
        });
      });
    }
    
    return () => {
      const cards = document.querySelectorAll('.poem-card');
      cards.forEach(card => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, [filteredPoems]);


  const navigateToPoemDetail = (poemId: string | number) => {
    router.push(`/poems/${poemId}`);
  };
  

  const navigateToAuthorProfile = (authorId: string) => {
    router.push(`/profile/${authorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Header */}
        <div className="mb-12 text-center bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-5" 
                 style={{backgroundImage: "url('/file.svg')", backgroundSize: "100px"}}></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Şiirleri Keşfet
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Poemica'daki en güzel şiirleri keşfedin, yeni yazarları takip edin ve ilham alın
          </p>
          
          {/* Search bar in hero */}
          <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-12 py-4 border-0 shadow-lg rounded-full text-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur-sm"
              placeholder="Şiir, yazar veya içerik ara..."
            />
            {searchQuery && (
              <button 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setSearchQuery('')}
                aria-label="Aramayı temizle"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Controls and Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Filter toggle button */}
            <button
              onClick={toggleFilters}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              <FiSliders className="mr-2" /> 
              <span className="hidden sm:inline">Filtreler</span>
            </button>
            
            {/* Sort dropdown */}
            <div className="flex items-center">
              <label htmlFor="sortBy" className="text-sm text-gray-500 font-medium mr-2 flex items-center">
                <FiFilter className="mr-2" /> <span className="hidden sm:inline">Sıralama:</span>
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="inline-flex rounded-lg border border-gray-200 px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="popular">En Beğenilen</option>
                <option value="views">En Çok Görüntülenen</option>
              </select>
            </div>
            
            {/* View toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'} transition-colors`}
                aria-label="Grid View"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'} transition-colors`}
                aria-label="List View"
              >
                <FiList />
              </button>
            </div>
          </div>
          
          {/* Expanded filters panel - shows when filters are active */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Gelişmiş Filtreler</h3>
                {(filterTag || searchQuery || sortBy !== 'newest') && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiRefreshCw className="mr-1" /> Filtreleri Temizle
                  </button>
                )}
              </div>
              
              {/* Popular tags */}
              <div>
                <h4 className="text-sm text-gray-500 font-medium mb-2 flex items-center">
                  <FiTag className="mr-2" /> Popüler Etiketler
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                        ${filterTag === tag 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      #{tag} <span className="text-xs opacity-70 ml-1">({count})</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Filter by date - future enhancement */}
              <div>
                <h4 className="text-sm text-gray-500 font-medium mb-2 flex items-center">
                  <FiCalendar className="mr-2" /> Tarihe Göre
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    Bu Hafta
                  </button>
                  <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    Bu Ay
                  </button>
                  <button className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    Bu Yıl
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active filters display */}
          {(filterTag || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 bg-blue-50 p-3 rounded-lg">
              <span className="text-sm text-blue-700 font-medium">Aktif Filtreler:</span>
              
              {searchQuery && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <FiSearch className="mr-1" /> 
                  {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-blue-900"
                    aria-label="Aramayı temizle"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filterTag && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <FiTag className="mr-1" /> 
                  #{filterTag}
                  <button 
                    onClick={() => setFilterTag(null)}
                    className="ml-1 hover:text-blue-900"
                    aria-label="Etiketi temizle"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {loading ? (

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${viewMode === 'list' ? 'flex' : ''} animate-pulse`}>
                  <div className={`${viewMode === 'list' ? 'w-72 h-40 flex-shrink-0' : ''}`}>
                    <div className={viewMode === 'list' ? "h-full bg-gray-200 w-full" : "h-52 bg-gray-200 w-full"}></div>
                    {viewMode !== 'list' && (
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
                    )}
                  </div>
                  {viewMode === 'list' && (
                    <div className="p-6 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : filteredPoems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
              <div className="mx-auto h-24 w-24 text-gray-300">
                <FiSearch className="h-full w-full" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sonuç bulunamadı</h3>
              <p className="mt-1 text-gray-500">Aramanızla eşleşen hiçbir şiir bulunamadı.</p>
              {(filterTag || searchQuery) && (
                <button 
                  onClick={clearAllFilters} 
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center mx-auto"
                >
                  <FiRefreshCw className="mr-1" /> Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPoems.map((poem, index) => (
                    <div 
                      key={poem.id} 
                      ref={index === filteredPoems.length - 1 ? lastPoemElementRef : null}
                      className="group poem-card bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
                      onClick={(e) => handlePoemClick(e, poem.id)}
                    >
                      {poem.coverImage ? (
                        <div className="relative h-60 w-full overflow-hidden">
                          <Image
                            src={poem.coverImage}
                            alt={poem.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex space-x-3 text-sm">
                              <div className="flex items-center">
                                <FiHeart className="w-4 h-4 mr-1" />
                                <span>{poem.likes}</span>
                              </div>
                              <div className="flex items-center">
                                <FiEye className="w-4 h-4 mr-1" />
                                <span>{poem.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-60 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                          <span className="text-6xl font-serif text-gray-300 italic">{poem.title.charAt(0)}</span>
                        </div>
                      )}
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {poem.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                          {poem.content}
                        </p>
                        
                        {poem.tags && poem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {poem.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag}
                                className="tag-chip px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTagClick(tag);
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                            {poem.tags.length > 3 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{poem.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center">
                            <ProfileAvatar user={poem.author} size="sm" />
                            <span 
                              className="author-link text-sm text-gray-700 hover:text-blue-600 hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${poem.author.id}`);
                              }}
                            >
                              {poem.author.name}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-400 flex items-center">
                            <FiClock className="mr-1 w-3 h-3" />
                            <span>{formatDate(poem.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (

                <div className="space-y-6">
                  {filteredPoems.map((poem, index) => (
                    <div 
                      key={poem.id}
                      ref={index === filteredPoems.length - 1 ? lastPoemElementRef : null}
                      className="group poem-card bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex cursor-pointer transform hover:-translate-y-1"
                      onClick={(e) => handlePoemClick(e, poem.id)}
                    >
                      {poem.coverImage ? (
                        <div className="relative w-72 h-48 flex-shrink-0 overflow-hidden">
                          <Image
                            src={poem.coverImage}
                            alt={poem.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 288px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="w-72 h-48 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                          <span className="text-5xl font-serif text-gray-300 italic">{poem.title.charAt(0)}</span>
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {poem.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {poem.content}
                        </p>
                        
                        {poem.tags && poem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {poem.tags.map(tag => (
                              <span 
                                key={tag}
                                className="tag-chip px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTagClick(tag);
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-auto">
                          <div className="flex items-center">
                            <ProfileAvatar user={poem.author} size="sm" />
                            <div>
                              <span 
                                className="author-link text-sm text-gray-700 hover:text-blue-600 hover:underline cursor-pointer block"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${poem.author.id}`);
                                }}
                              >
                                {poem.author.name}
                              </span>
                              <div className="text-xs text-gray-400 flex items-center">
                                <FiClock className="mr-1 w-3 h-3" />
                                <span>{formatDate(poem.createdAt)}</span>
                              </div>
                            </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Load More Button - now only shows if not using infinite scroll */}
        {!loading && filteredPoems.length > 0 && hasMore && (filterTag || searchQuery) && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white 
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
        
        {/* Loading indicator for infinite scroll */}
        {loadingMore && !filterTag && !searchQuery && (
          <div className="my-8 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600">
              <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Daha fazla içerik yükleniyor...
            </div>
          </div>
        )}
        
        {/* End of results */}
        {!loading && !loadingMore && filteredPoems.length > 0 && !hasMore && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center space-x-2">
              <FiTrendingUp className="text-blue-500" />
              <span className="text-gray-500 text-sm">Tüm şiirler yüklendi</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
