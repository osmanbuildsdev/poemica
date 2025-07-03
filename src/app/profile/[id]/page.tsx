"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStatus } from "@/lib/hooks";
import Link from "next/link";
import { getInitials, getAvatarColor } from "@/lib/avatarUtils";
import ProfileAvatar from "@/components/ProfileAvatar";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const { session, isAuthenticated } = useAuthStatus();
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [poems, setPoems] = useState<{ id: string; title: string; createdAt: string }[]>([]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await fetch(`/api/users/${params.id}`);
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }
    async function fetchFollowers() {
      const res = await fetch(`/api/users/${params.id}/followers`);
      const data = await res.json();
      setFollowers(data.followers || []);
    }
    async function fetchFollowing() {
      const res = await fetch(`/api/users/${params.id}/following`);
      const data = await res.json();
      setFollowing(data.following || []);
    }
    async function fetchPoems() {
      const res = await fetch(`/api/users/${params.id}/poems`);
      const data = await res.json();
      setPoems(data.poems || []);
    }
    

    fetchProfile();
    fetchFollowers();
    fetchFollowing();
    fetchPoems();
  }, [params.id]);

  useEffect(() => {
    async function fetchFollowStatus() {
      if (!isAuthenticated || !session?.user?.id || !params.id) return;
      const res = await fetch(`/api/users/${params.id}/follow`);
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    }
    fetchFollowStatus();
  }, [isAuthenticated, session?.user?.id, params.id]);

  async function handleFollow() {
    if (!isAuthenticated || !session?.user) return;
    const email = session.user.email ?? "";
    const res = await fetch(`/api/users/${params.id}/follow`, {
      method: "POST",
      headers: {
        "x-auth-email": email,
        "x-auth-user-id": session.user.id,
      },
    });
    const data = await res.json();
    setIsFollowing(data.isFollowing);
  }

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!user) return <div className="p-8 text-center text-red-600">Kullanıcı bulunamadı.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profil Bilgileri */}
      <div className="mb-8">
        <div className="border border-gray-200 rounded-lg p-6 shadow-md bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="border-2 border-white shadow-lg rounded-full">
                <ProfileAvatar 
                  user={user} 
                  size="lg"
                  showEditOverlay={isAuthenticated && session?.user?.id === user.id}
                />
              </div>
              
              {/* Profil fotoğrafı değiştirme opsiyonu (kendi profili ise) */}
              {isAuthenticated && session?.user?.id === user.id && (
                <Link href="/profile/settings#profile-image" className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs flex flex-col items-center p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Değiştir
                  </span>
                </Link>
              )}
            </div>
            
            {/* Kullanıcı Bilgileri */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
              {/* <p className="text-gray-500">{user.email}</p> */}
              {user.bio && <p className="text-gray-600 mt-2 text-sm">{user.bio}</p>}
              
              {/* İstatistikler */}
              <div className="flex gap-6 mt-4">
                <div className="flex items-center">
                  <div className="flex flex-col items-center mr-6">
                    <span className="font-bold text-lg text-gray-800">{poems.length}</span>
                    <span className="text-xs text-gray-500">Şiir</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex flex-col items-center mr-6">
                    <span className="font-bold text-lg text-gray-800">{followers.length}</span>
                    <span className="text-xs text-gray-500">Takipçi</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-lg text-gray-800">{following.length}</span>
                    <span className="text-xs text-gray-500">Takip Edilen</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Takip Butonu veya Profili Düzenle Butonu */}
            {isAuthenticated && (
              <>
                {session?.user?.id === user.id ? (
                  <Link href="/profile/settings" className="px-5 py-2 rounded-full font-medium transition-all border text-sm hover:shadow-md bg-indigo-500 text-white border-transparent hover:bg-indigo-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Profili Düzenle
                  </Link>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-5 py-2 rounded-full font-medium transition-all border text-sm hover:shadow-md
                      ${isFollowing 
                        ? "bg-white text-gray-600 border-gray-200 hover:bg-gray-50" 
                        : "bg-blue-500 text-white border-transparent hover:bg-blue-600"
                      }`}
                  >
                    {isFollowing ? "Takibi Bırak" : "Takip Et"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* İçerik Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Şiirler */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-5 flex items-center border-b border-gray-100 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Şiirler
            </h2>
            
            {poems.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-gray-400 text-sm">Henüz paylaşılan şiir bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {poems.map(poem => (
                  <Link key={poem.id} href={`/poems/${poem.id}`} className="block">
                    <div className="p-4 hover:bg-blue-50 border border-gray-200 rounded-md transition-all hover:shadow-sm">
                      <h3 className="font-medium text-gray-800 hover:text-blue-600">{poem.title}</h3>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Takipçi ve Takip Edilenler */}
        <div>
          {/* Takipçiler */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center border-b border-gray-100 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Takipçiler
            </h2>
            
            {followers.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz takipçi yok</p>
            ) : (
              <div className="space-y-2">
                {followers.map(f => (
                  <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <ProfileAvatar user={f} size="sm" />
                    <span className="ml-2 text-sm text-gray-700">{f.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Takip Edilenler */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center border-b border-gray-100 pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Takip Edilenler
            </h2>
            
            {following.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz takip edilen kullanıcı yok</p>
            ) : (
              <div className="space-y-2">
                {following.map(f => (
                  <Link key={f.id} href={`/profile/${f.id}`} className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors">
                    <ProfileAvatar user={f} size="sm" />
                    <span className="ml-2 text-sm text-gray-700">{f.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Akışa Dön Butonu */}
      <div className="flex justify-center mt-8">
        <Link href="/feed" className="inline-flex items-center px-5 py-2 border border-blue-200 rounded-full shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none transition-all hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Akışa Dön
        </Link>
      </div>
    </div>
  );
}
