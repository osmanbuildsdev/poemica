"use client";

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiEye, FiMessageSquare, FiUser, FiShare2, FiBookmark } from 'react-icons/fi';
import { useAuthStatus } from "@/lib/hooks";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import ProfileAvatar from "@/components/ProfileAvatar";
import PoemActions from '@/components/poems/PoemActions';
import { BiComment } from 'react-icons/bi';
import { MdOutlineRecommend, MdRecommend } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';

interface Poem {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  likes: number;
  views: number;
  coverImage?: string | null;
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  author: {
    id: string;
    name: string;
    image?: string | null;
  };
  createdAt: string;
}


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.05 }
};

export default function PoemDetailPage() {
  const params = useParams();
  const { session, status, isAuthenticated } = useAuthStatus();
  const [isPending, startTransition] = useTransition();
  

  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [recommendCount, setRecommendCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageError, setImageError] = useState(false);


  useEffect(() => {
    const fetchPoem = async () => {
      try {
        const response = await fetch(`/api/poems/${params.id}`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Beklenmeyen response:', text);
          throw new Error('Sunucu hatası veya yetkisiz erişim!');
        }
        if (!response.ok) throw new Error('Şiir bulunamadı');
        const data = await response.json();
        setPoem(data.poem);
        setLikeCount(data.poem.likes || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchPoem();
  }, [params.id]);


  useEffect(() => {
    if (!isAuthenticated || !poem) return;

    const fetchUserData = async () => {
      try {
        const commonConfig = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.email}`
          }
        };

        const [likeRes, recommendRes, recommendCountRes] = await Promise.all([
          fetch(`/api/poems/${params.id}/like/status`, commonConfig),
          fetch(`/api/poems/${params.id}/recommend/status`, commonConfig),
          fetch(`/api/poems/${params.id}/recommend-count`, commonConfig)
        ]);


        const parseSafe = async (res: Response) => {
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) return {};
          const text = await res.text();
          if (!text) return {};
          return JSON.parse(text);
        };

        const [likeData, recommendData, recommendCountData] = await Promise.all([
          parseSafe(likeRes),
          parseSafe(recommendRes),
          parseSafe(recommendCountRes)
        ]);

        setLiked(likeData.liked || false);
        setRecommended(recommendData.recommended || false);
        setRecommendCount(recommendCountData.count || 0);
      } catch (error) {
        console.error('Kullanıcı verilerini yüklerken hata:', error);
      }
    };

    fetchUserData();
  }, [params.id, isAuthenticated, poem, session?.user?.email]);


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/poems/${params.id}/comment`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Beklenmeyen response:', text);
          return;
        }
        const data = await response.json();
        if (data.success !== false) {
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
      }
    };

    fetchComments();  }, [params.id]);


  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Beğenmek için giriş yapmalısınız', {
        icon: '🔒'
      });
      return;
    }

    startTransition(async () => {
      try {        
        const response = await fetch(`/api/poems/${params.id}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.email}`
          }
        });        
        const data = await response.json();
        
        if (data.success) {
          setLiked(data.liked);
          setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
          toast.success(data.liked ? 'Şiir beğenildi' : 'Beğeni kaldırıldı', {
            icon: data.liked ? '❤️' : '💔'
          });
        } else {
          toast.error(data.message || 'Bir hata oluştu');
        }
      } catch (error) {
        toast.error('Bir hata oluştu', {
          icon: '❌'
        });
      }
    });
  }, [isAuthenticated, params.id, session?.user?.email, liked]);


  const handleRecommend = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Tavsiye etmek için giriş yapmalısınız', {
        icon: '🔒'
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/poems/${params.id}/recommend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.email}`
          }
        });        const data = await response.json();
        if (data.success) {
          setRecommended(data.recommended);
          setRecommendCount(prev => data.recommended ? prev + 1 : prev - 1);
          toast.success(data.recommended ? 'Şiir tavsiye edildi' : 'Tavsiye kaldırıldı', {
            icon: data.recommended ? '�' : '�'
          });
        }
      } catch (error) {
        toast.error('Bir hata oluştu', {
          icon: '❌'
        });
      }
    });
  }, [isAuthenticated, params.id, session?.user?.email, recommended]);


  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız', {
        icon: '🔒'
      });
      return;
    }

    if (!commentInput.trim()) {
      toast.error('Yorum boş olamaz', {
        icon: '✍️'
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/poems/${params.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.email}`
        },
        body: JSON.stringify({ content: commentInput })
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setCommentInput('');
        setShowCommentForm(false);
        toast.success('Yorum eklendi', {
          icon: '💬'
        });
      }
    } catch (error) {
      toast.error('Yorum eklenirken bir hata oluştu', {
        icon: '❌'
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: poem?.title,
          text: `${poem?.title} - ${poem?.author.name}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Bağlantı kopyalandı!', {
          icon: '📋'
        });
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <div className="w-full h-64 animate-pulse bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }


  if (error || !poem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <FiMessageSquare className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Hata</h1>
            <p className="text-gray-600">{error || 'Şiir bulunamadı'}</p>
            <Link
              href="/explore"
              className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
            >
              Şiirleri Keşfet
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >        {/* Ana İçerik Kartı */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden mb-8">
          
          {/* Kapak Resmi */}
          {poem.coverImage && !imageError ? (
            <div className="relative w-full h-80 md:h-96 overflow-hidden group">
              <Image
                src={poem.coverImage}
                alt={poem.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                unoptimized
                onClick={() => setShowImageModal(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Hover overlay efekti */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                   onClick={() => setShowImageModal(true)}></div>
              
              {/* Şiir bilgileri overlay (hover'da görünür) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {poem.title}
                </h1>
                <div className="flex items-center text-white/90 text-sm">
                  <span className="font-medium">{poem.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(poem.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <FiEye className="w-3 h-3 mr-1" />
                    {poem.views} görüntülenme
                  </span>
                </div>
              </div>
              
              {/* Aksiyon butonları (hover'da görünür) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(true);
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  title="Tam ekran görüntüle"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
                <a
                  href={poem.coverImage}
                  download={`${poem.title}-kapak.jpg`}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  title="Resmi indir"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            /* Fallback tasarımı - resim yokken veya hata durumunda */
            <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center overflow-hidden">
              {/* Arka plan pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="60" height="60" viewBox="0 0 60 60" className="w-full h-full">
                  <defs>
                    <pattern id="poem-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.3"/>
                      <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.2"/>
                      <circle cx="50" cy="50" r="1" fill="currentColor" opacity="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#poem-pattern)"/>
                </svg>
              </div>
              
              {/* Merkez içerik */}
              <div className="text-center z-10 px-6">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <span className="text-4xl font-serif text-gray-400 italic">
                      {poem.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mb-3 drop-shadow-sm">
                  {poem.title}
                </h1>
                <div className="flex items-center justify-center text-gray-600 text-sm mb-4">
                  <span className="font-medium">{poem.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(poem.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="inline-flex items-center bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600">
                  <FiEye className="w-4 h-4 mr-2" />
                  {poem.views} görüntülenme
                </div>
              </div>
              
              {/* Dekoratif elementler */}
              <div className="absolute top-6 left-6 w-8 h-8 border-2 border-gray-300 rounded-full opacity-20"></div>
              <div className="absolute bottom-6 right-6 w-6 h-6 border-2 border-gray-300 rounded-full opacity-20"></div>
              <div className="absolute top-1/3 right-8 w-4 h-4 bg-gray-300 rounded-full opacity-15"></div>
            </div>
          )}

          {/* İçerik Başlığı ve Yazar */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">              <div className="flex items-center">
                {/* Yazar Avatar - ProfileAvatar bileşenini kullan */}
                <Link href={`/profile/${poem.author.id}`} className="group">
                  <ProfileAvatar 
                    user={{
                      id: poem.author.id,
                      name: poem.author.name,
                      image: poem.author.image
                    }}
                    size="md"
                  />
                </Link>
                <div className="ml-3">
                  <Link href={`/profile/${poem.author.id}`} className="font-medium text-gray-800 hover:text-blue-600 transition-colors">
                    {poem.author.name}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {new Date(poem.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              {/* Hızlı Eylemler */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all"
                  title="Paylaş"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
                <div>
                  <PoemActions poemId={poem.id} variant="icon" />
                </div>
              </div>
            </div>

            {/* Başlık */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              {poem.title}
            </h1>
            
            {/* Şiir İçeriği */}
            <div className="whitespace-pre-line text-gray-700 leading-relaxed mb-8 text-lg">
              {poem.content}
            </div>

            {/* İstatistikler */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6 border-t border-b border-gray-100 py-4">
              <div className="flex items-center">
                <FiEye className="w-4 h-4 mr-2 text-gray-400" />
                <span>{poem.views} görüntülenme</span>
              </div>
              <div className="flex items-center">
                <FiHeart className="w-4 h-4 mr-2 text-pink-500" />
                <span>{likeCount} beğeni</span>
              </div>
              <div className="flex items-center">
                <MdOutlineRecommend className="w-4 h-4 mr-2 text-blue-500" />
                <span>{recommendCount} tavsiye</span>
              </div>
              <div className="flex items-center">
                <BiComment className="w-4 h-4 mr-2 text-green-500" />
                <span>{comments.length} yorum</span>
              </div>
            </div>

            {/* Etkileşim Butonları */}
            <div className="flex flex-wrap gap-3">
              {/* Beğen Butonu */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLike}
                disabled={isPending}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-all text-sm
                  ${liked 
                    ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {liked ? (
                  <FaThumbsUp className="w-4 h-4 mr-2 text-pink-600" />
                ) : (
                  <FaRegThumbsUp className="w-4 h-4 mr-2 text-gray-500" />
                )}
                {liked ? 'Beğenildi' : 'Beğen'}
              </motion.button>

              {/* Tavsiye Et Butonu */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRecommend}
                disabled={isPending}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-all text-sm
                  ${recommended 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {recommended ? (
                  <MdRecommend className="w-4 h-4 mr-2 text-blue-600" />
                ) : (
                  <MdOutlineRecommend className="w-4 h-4 mr-2 text-gray-500" />
                )}
                {recommended ? 'Tavsiye Edildi' : 'Tavsiye Et'}              </motion.button>

              {/* Yorum Butonu */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCommentForm(prev => !prev)}
                className="flex items-center px-4 py-2 rounded-md font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all text-sm"
              >
                <BiComment className="w-4 h-4 mr-2 text-gray-500" />
                Yorum Yap              </motion.button>

              {/* Paylaş Butonu - Mobilde görünür */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="md:hidden flex items-center px-4 py-2 rounded-md font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all text-sm"
              >
                <FiShare2 className="w-4 h-4 mr-2 text-gray-500" />
                Paylaş
              </motion.button>
            </div>          </div>          <AnimatePresence>
            {showCommentForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100 p-8"
              >
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <TextareaAutosize
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Düşüncelerinizi paylaşın..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 transition-all resize-none"
                      minRows={3}
                      maxRows={6}
                    />
                    <div className="flex justify-end gap-3">
                      <motion.button
                        variants={buttonVariants}
                        whileTap="tap"
                        whileHover="hover"
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        İptal
                      </motion.button>
                      <motion.button
                        variants={buttonVariants}
                        whileTap="tap"
                        whileHover="hover"
                        type="submit"
                        disabled={isSubmittingComment || !commentInput.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmittingComment ? 'Gönderiliyor...' : 'Gönder'}
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Yorum yapmak için giriş yapmalısınız</p>
                    <Link
                      href="/login"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all"
                    >
                      Giriş Yap
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {comments.length > 0 && (
            <div className="border-t border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Yorumlar</h3>
              <div className="space-y-6">
                {comments.map((comment) => (                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <ProfileAvatar 
                          user={{
                            id: comment.author.id,
                            name: comment.author.name,
                            image: comment.author.image
                          }}
                          size="sm"
                        />
                      </motion.div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {comment.author?.name || "Bilinmeyen Kullanıcı"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Resim Modal/Lightbox */}
      <AnimatePresence>
        {showImageModal && poem.coverImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative max-w-7xl max-h-full w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Kapatma butonu */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Aksiyon butonları */}
              <div className="absolute -top-12 left-0 flex gap-2 z-10">
                <a
                  href={poem.coverImage}
                  download={`${poem.title}-kapak.jpg`}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white hover:bg-white/30 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  İndir
                </a>
              </div>
              
              {/* Ana resim */}
              <div className="relative w-full h-[80vh] bg-black/20 rounded-lg overflow-hidden">
                <Image
                  src={poem.coverImage}
                  alt={poem.title}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
              
              {/* Resim bilgileri */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h2 className="text-2xl font-bold text-white mb-2">{poem.title}</h2>
                <div className="flex items-center text-white/80 text-sm">
                  <span className="font-medium">{poem.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(poem.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}