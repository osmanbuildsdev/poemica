"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHeart, FiEye, FiClock, FiTrash2, FiEdit2 } from 'react-icons/fi';
import ProfileAvatar from "@/components/ProfileAvatar";
import { useSession } from "next-auth/react";

type Author = {
  id: string | number;
  name: string;
  image?: string | null;
};

type Poem = {
  id: number | string;
  title: string;
  content: string;
  authorId: number | string;
  createdAt: string;
  updatedAt: string;
  coverImage?: string | null;
  likes?: number;
  views?: number;
  author?: Author;
  tags?: string[];
};

export default function PoemList({ tag, authorId, showOnlyUserPoems = false }: { 
  tag?: string; 
  authorId?: string; 
  showOnlyUserPoems?: boolean; 
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTag, setActiveTag] = useState<string | undefined>(tag);
  const [deletingPoemId, setDeletingPoemId] = useState<string | number | null>(null);


  useEffect(() => {
    setActiveTag(tag);
  }, [tag]);

  useEffect(() => {
    async function fetchPoems() {
      setIsLoading(true);
      try {
        let apiUrl;
        

        if (showOnlyUserPoems && session?.user?.id) {
          apiUrl = `/api/users/${session.user.id}/poems`;
          if (activeTag) {
            apiUrl += `?tag=${encodeURIComponent(activeTag)}`;
          }
        }

        else if (authorId) {
          apiUrl = `/api/users/${authorId}/poems`;
          if (activeTag) {
            apiUrl += `?tag=${encodeURIComponent(activeTag)}`;
          }
        }

        else {
          apiUrl = activeTag 
            ? `/api/poems?tag=${encodeURIComponent(activeTag)}`
            : "/api/poems";
        }
          
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error("Şiirler yüklenemedi");
        }
        
        const data = await response.json();
        let filteredPoems = data.poems || [];
        

        if (showOnlyUserPoems && activeTag) {
          filteredPoems = filteredPoems.filter((poem: Poem) => 
            poem.tags && Array.isArray(poem.tags) && poem.tags.includes(activeTag)
          );
        }
        
        setPoems(filteredPoems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Şiirler yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    }
    

    if (!showOnlyUserPoems || session?.user?.id) {
      fetchPoems();
    }
  }, [activeTag, showOnlyUserPoems, session?.user?.id, authorId]);


  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  const handleClick = (e: React.MouseEvent, poemId: string | number) => {

    if ((e.target as HTMLElement).closest('.author-link') || 
        (e.target as HTMLElement).closest('.poem-actions')) return;
    router.push(`/poems/${poemId}`);
  };


  const handleDeletePoem = async (poemId: string | number) => {
    if (!session?.user?.email || !session?.user?.id) {
      alert("Şiiri silmek için oturum açmanız gerekiyor.");
      return;
    }

    if (!confirm("Bu şiiri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    setDeletingPoemId(poemId);

    try {
      const response = await fetch(`/api/poems/${poemId}/delete`, {
        method: "DELETE",
        headers: {
          "x-auth-email": session.user.email,
          "x-auth-user-id": session.user.id,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {

        setPoems(prevPoems => prevPoems.filter(poem => poem.id !== poemId));
        alert("Şiir başarıyla silindi.");
      } else {
        alert(data.error || "Şiir silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Şiir silinirken hata:", error);
      alert("Şiir silinirken bir hata oluştu.");
    } finally {
      setDeletingPoemId(null);
    }
  };


  const isAuthor = (poem: Poem) => {
    return session?.user?.id && poem.authorId && 
           session.user.id === poem.authorId.toString();
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
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
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        {error}
      </div>
    );
  }
  if (poems.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">
          {showOnlyUserPoems 
            ? "Henüz hiç şiiriniz yok" 
            : authorId 
              ? "Bu kullanıcının henüz şiiri yok"
              : "Henüz hiç şiir yok"
          }
        </h3>
        <p className="mt-1 text-gray-500">
          {showOnlyUserPoems 
            ? "İlk şiirinizi eklemek için \"Yeni Şiir\" düğmesine tıklayın."
            : authorId
              ? "Bu kullanıcı henüz şiir paylaşmamış."
              : "İlk şiiri eklemek için \"Yeni Şiir\" düğmesine tıklayın."
          }
        </p>
        {(showOnlyUserPoems || !authorId) && (
          <div className="mt-6">
            <Link href="/create-poem" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Yeni Şiir Ekle
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (    <div className="space-y-6">      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {showOnlyUserPoems ? "Şiirlerim" : "Şiirler"}
          </h2>
          {activeTag && (
            <div className="flex items-center gap-1">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                #{activeTag}
              </span>
              <button 
                onClick={() => {
                  setActiveTag(undefined);
                  router.push(showOnlyUserPoems ? '/dashboard' : '/explore');
                }}
                className="text-gray-400 hover:text-gray-600" 
                title="Filtre temizle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {(showOnlyUserPoems || !authorId) && (
          <Link href="/create-poem" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Yeni Şiir Ekle
          </Link>
        )}
      </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {poems.map((poem) => (
          <div 
            key={poem.id} 
            className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
            onClick={(e) => handleClick(e, poem.id)}
          >            {poem.coverImage ? (
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
                
                {/* Author actions on image */}
                {isAuthor(poem) && (
                  <div className="poem-actions absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      href={`/poems/${poem.id}/edit`}
                      className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
                      title="Şiiri düzenle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiEdit2 className="w-4 h-4 text-white" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePoem(poem.id);
                      }}
                      disabled={deletingPoemId === poem.id}
                      className="p-2 bg-white/20 backdrop-blur-sm hover:bg-red-500/30 rounded-full transition-colors disabled:opacity-50"
                      title="Şiiri sil"
                    >
                      {deletingPoemId === poem.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"></div>
                      ) : (
                        <FiTrash2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex space-x-3 text-sm">
                    {typeof poem.likes === 'number' && (
                      <div className="flex items-center">
                        <FiHeart className="w-4 h-4 mr-1" />
                        <span>{poem.likes}</span>
                      </div>
                    )}
                    {typeof poem.views === 'number' && (
                      <div className="flex items-center">
                        <FiEye className="w-4 h-4 mr-1" />
                        <span>{poem.views}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-60 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                <span className="text-6xl font-serif text-gray-300 italic">{poem.title.charAt(0)}</span>
                
                {/* Author actions on placeholder */}
                {isAuthor(poem) && (
                  <div className="poem-actions absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link
                      href={`/poems/${poem.id}/edit`}
                      className="p-2 bg-white hover:bg-gray-50 rounded-full shadow-sm transition-colors"
                      title="Şiiri düzenle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiEdit2 className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePoem(poem.id);
                      }}
                      disabled={deletingPoemId === poem.id}
                      className="p-2 bg-white hover:bg-red-50 rounded-full shadow-sm transition-colors disabled:opacity-50"
                      title="Şiiri sil"
                    >
                      {deletingPoemId === poem.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
                      ) : (
                        <FiTrash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}            <div className="p-6 flex-1 flex flex-col">
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
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTag(tag);
                        const basePath = showOnlyUserPoems ? '/dashboard' : '/explore';
                        router.push(`${basePath}?tag=${encodeURIComponent(tag)}`);
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
                  {poem.author && (
                    <ProfileAvatar
                      user={{
                        id: poem.author.id?.toString?.() ?? undefined,
                        name: poem.author.name ?? undefined,
                        image: poem.author.image ?? undefined,
                      }}
                      size="sm"
                    />
                  )}
                  <span 
                    className="author-link text-sm text-gray-700 hover:text-blue-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (poem.author?.id) {
                        router.push(`/profile/${poem.author.id}`);
                      }
                    }}
                  >
                    {poem.author?.name || 'Anonim'}
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
    </div>
  );
}