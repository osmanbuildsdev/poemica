"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiShuffle, FiHeart, FiBookmark, FiMessageCircle, FiThumbsUp, FiEye, FiCalendar, FiHash, FiUser } from "react-icons/fi";
import ProfileAvatar from "@/components/ProfileAvatar";
import PoemActions from "@/components/poems/PoemActions";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

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
  saves?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
};




export default function RandomPoemPage() {
  const { data: session } = useSession();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [seenPoemIds, setSeenPoemIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [localRecommends, setLocalRecommends] = useState(0);  async function fetchRandomPoem() {
    setLoading(true);
    setError("");
    try {
      const exclude = seenPoemIds.length > 0 ? `?exclude=${seenPoemIds.join(",")}` : "";
      const res = await fetch(`/api/poems/random${exclude}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPoem(data.data);
        

        if (data.resetSeen) {
          setSeenPoemIds([data.data.id]);
        } else {
          setSeenPoemIds((prev: number[]) => [...prev, data.data.id]);
        }
        
        setLocalLikes(data.data.likes || 0);
        setLocalRecommends(data.data.recommends || 0);
        

        if (session?.user) {
          await checkUserInteractions(data.data.id);
        } else {
          setIsLiked(false);
          setIsRecommended(false);
        }
        
        setShowComment(false);
        setComment("");
      } else {
        setPoem(null);
        setError(data.message || "Şiir yüklenirken bir hata oluştu.");
      }
    } catch (e) {
      setError("Şiir yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function checkUserInteractions(poemId: number) {
    if (!session?.user) return;
    
    try {

      const likeRes = await fetch(`/api/poems/${poemId}/like/status`, {
        headers: {
          'Authorization': `Bearer ${session.user.email}`,
          'Content-Type': 'application/json'
        }
      });
      if (likeRes.ok) {
        const likeData = await likeRes.json();
        setIsLiked(likeData.liked || false);
      }


      const recommendRes = await fetch(`/api/poems/${poemId}/recommend/status`, {
        headers: {
          'Authorization': `Bearer ${session.user.email}`,
          'Content-Type': 'application/json'
        }
      });
      if (recommendRes.ok) {
        const recommendData = await recommendRes.json();
        setIsRecommended(recommendData.recommended || false);
      }
    } catch (error) {
      console.error("Kullanıcı etkileşim durumu kontrol edilemedi:", error);
    }
  }
  async function handleLike() {
    if (!session || !poem) return;
    
    try {
      const res = await fetch(`/api/poems/${poem.id}/like`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session.user?.email}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLiked(data.liked);
          setLocalLikes(prev => data.liked ? prev + 1 : prev - 1);
        }
      } else {
        console.error("Beğeni işlemi başarısız:", await res.text());
      }
    } catch (error) {
      console.error("Beğeni hatası:", error);
    }
  }

  async function handleRecommend() {
    if (!session || !poem) return;
    
    try {
      const res = await fetch(`/api/poems/${poem.id}/recommend`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session.user?.email}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsRecommended(data.recommended);
          setLocalRecommends(prev => data.recommended ? prev + 1 : prev - 1);
        }
      } else {
        console.error("Tavsiye işlemi başarısız:", await res.text());
      }
    } catch (error) {
      console.error("Tavsiye hatası:", error);
    }
  }
  async function handleCommentSubmit() {
    if (!session || !poem || !comment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/poems/${poem.id}/comment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: comment })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setComment("");
          setShowComment(false);

        }
      } else {
        console.error("Yorum işlemi başarısız:", await res.text());
      }
    } catch (error) {
      console.error("Yorum hatası:", error);
    } finally {
      setIsSubmittingComment(false);
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

  useEffect(() => {
    fetchRandomPoem();

  }, []);  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8">        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </motion.div>
        )}{/* Poem Card */}
        <AnimatePresence mode="wait">
          {poem && (
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex gap-6 items-center w-full max-w-5xl"
            >
              {/* Poem Content */}
              <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 relative">
                {/* Save Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <PoemActions poemId={poem.id} variant="icon" />
                </div>

                {/* Author Header */}
                <div className="bg-white p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${poem.author.id}`} className="group">
                      <ProfileAvatar user={poem.author} size="md" />
                    </Link>
                    <div className="flex-1">
                      <Link
                        href={`/profile/${poem.author.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {poem.author.name}
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={14} />
                          {formatDate(poem.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiEye size={14} />
                          {poem.views} görüntülenme
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Poem Content */}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {poem.title}
                  </h2>
                  
                  <div className="prose prose-lg max-w-none text-center leading-relaxed">
                    <div className="whitespace-pre-line text-gray-700 font-medium leading-8">
                      {poem.content}
                    </div>
                  </div>

                  {/* Tags */}
                  {poem.tags && poem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 justify-center">
                      {poem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          <FiHash size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
                  {/* Stats */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <span className="flex items-center gap-2 text-gray-600">
                      <FiHeart className="text-pink-500" size={18} />
                      <span className="font-medium">{localLikes}</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <FiThumbsUp className="text-blue-500" size={18} />
                      <span className="font-medium">{localRecommends}</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <FiMessageCircle className="text-green-500" size={18} />
                      <span className="font-medium">{poem.commentsCount || 0}</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {session ? (
                    <div className="flex items-center justify-center gap-4">
                      <motion.button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          isLiked
                            ? "bg-pink-100 text-pink-700 border border-pink-200"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-pink-50 hover:text-pink-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiHeart className={isLiked ? "fill-current" : ""} size={16} />
                        {isLiked ? "Beğenildi" : "Beğen"}
                      </motion.button>

                      <motion.button
                        onClick={handleRecommend}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          isRecommended
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiThumbsUp className={isRecommended ? "fill-current" : ""} size={16} />
                        {isRecommended ? "Tavsiye Edildi" : "Tavsiye Et"}
                      </motion.button>

                      <motion.button
                        onClick={() => setShowComment(!showComment)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-200 hover:bg-green-50 hover:text-green-600 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiMessageCircle size={16} />
                        Yorum Yap
                      </motion.button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Şiirlerle etkileşime geçmek için giriş yapın</p>
                      <div className="flex justify-center gap-3">
                        <Link
                          href="/login"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          href="/register"
                          className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Üye Ol
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Comment Form */}
                  <AnimatePresence>
                    {showComment && session && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Şiir hakkında düşüncelerinizi paylaşın..."
                            className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setShowComment(false)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              İptal
                            </button>
                            <button
                              onClick={handleCommentSubmit}
                              disabled={!comment.trim() || isSubmittingComment}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isSubmittingComment ? "Gönderiliyor..." : "Yorum Yap"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>              {/* Next Poem Button - Right Side */}
              <div className="flex flex-col items-center justify-center">
                <motion.button
                  onClick={fetchRandomPoem}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group min-w-[140px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={loading ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                    className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors"
                  >
                    <FiShuffle className="text-2xl text-blue-600" />
                  </motion.div>
                  <span className="text-sm text-gray-700 text-center">
                    {loading ? "Karıştırılıyor..." : "Yeni Şiir"}
                  </span>
                </motion.button>
                  {seenPoemIds.length > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {seenPoemIds.length} şiir keşfettiniz
                    {seenPoemIds.length >= 10 && (
                      <span className="block text-blue-600 font-medium">
                        Tüm şiirleri gördünüz, baştan devam ediyoruz!
                      </span>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
