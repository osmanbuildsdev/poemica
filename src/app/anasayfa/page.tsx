"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PoemSlider from "@/components/poems/PoemSlider";
import Sidebar from "@/components/layout/Sidebar";

export default function Anasayfa() {
  const [feed, setFeed] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [mostLiked, setMostLiked] = useState<any[]>([]);
  const [allPoems, setAllPoems] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [sliderPoems, setSliderPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      const sliderRes = await fetch("/api/poems/trending?limit=7");
      const sliderData = await sliderRes.json();
      setSliderPoems(sliderData.data || []);

      const feedRes = await fetch("/api/poems/feed");
      const feedData = await feedRes.json();
      setFeed(feedData.data || []);
      const suggestedRes = await fetch("/api/poems/trending?limit=6");
      const suggestedData = await suggestedRes.json();
      setSuggested(suggestedData.data || []);
      const likedRes = await fetch("/api/poems/trending?limit=6&since=24h");
      const likedData = await likedRes.json();
      setMostLiked(likedData.data || []);

      const allPoemsRes = await fetch("/api/poems");
      const allPoemsData = await allPoemsRes.json();
      setAllPoems(allPoemsData.poems || []);
      const usersRes = await fetch("/api/users");
      const usersData = await usersRes.json();
      setAllUsers(usersData.users || []);
      setLoading(false);
    }
    fetchAll();
  }, []);


  const topPoets = (() => {
    if (!allPoems.length || !allUsers.length) return [];
    const poetMap: Record<string, { user: any; totalLikes: number }> = {};
    allPoems.forEach((poem: any) => {
      if (!poetMap[poem.authorId]) {
        const user = allUsers.find((u: any) => u.id === poem.authorId);
        if (user) poetMap[poem.authorId] = { user, totalLikes: 0 };
      }
      if (poetMap[poem.authorId]) poetMap[poem.authorId].totalLikes += poem.likes || 0;
    });
    return Object.values(poetMap)
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 3);
  })();


  const featured = suggested[0];
  const smallCards = suggested.slice(1, 7);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Hoş geldin! 👋</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-20">Yükleniyor...</div>
        ) : (
          <>
            {/* Slider */}
            <div className="mb-12">
              <PoemSlider poems={sliderPoems} />
            </div>

            {/* Üstte: Featured şiir ve küçük kartlar */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Senin İçin Önerilenler</h2>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Featured */}
                {featured && (
                  <div className="flex-1 min-w-[260px] max-w-md relative bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col justify-end group transition-transform duration-300 hover:scale-105">
                    {featured.coverImage && (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        className="object-cover object-center absolute inset-0 z-0"
                        unoptimized
                      />
                    )}
                    <div className="relative z-10 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{featured.title}</h3>
                      <p className="text-white/90 text-sm mb-3 line-clamp-2 drop-shadow">{featured.content?.split("\n").slice(0, 2).join(" ")}</p>
                      <Link href={`/poems/${featured.id}`} className="inline-block mt-2 bg-white/90 hover:bg-white text-blue-700 font-semibold rounded-full px-4 py-2 text-sm shadow transition">Daha fazla oku</Link>
                    </div>
                  </div>
                )}
                {/* Küçük kartlar */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {smallCards.map((poem) => (
                    <div key={poem.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col group hover:scale-105 duration-300">
                      {poem.coverImage && (
                        <div className="relative w-full h-28">
                          <Image
                            src={poem.coverImage}
                            alt={poem.title}
                            fill
                            className="object-cover object-center"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{poem.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{poem.content?.split("\n")[0]}</p>
                        <div className="flex items-center gap-2 text-xs text-pink-600 font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {poem.likes || 0}
                        </div>
                        <Link href={`/poems/${poem.id}`} className="text-xs text-blue-600 hover:underline mt-auto">Oku</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alt: Top 6 şiir ve Top 3 şair */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Top 6 Books */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">TOP 6 ŞİİR</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {mostLiked.slice(0, 6).map((poem) => (
                    <div key={poem.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col group hover:scale-105 duration-300">
                      {poem.coverImage && (
                        <div className="relative w-full h-32">
                          <Image
                            src={poem.coverImage}
                            alt={poem.title}
                            fill
                            className="object-cover object-center"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h4 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">{poem.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{poem.content?.split("\n")[0]}</p>
                        <div className="flex items-center gap-2 text-xs text-pink-600 font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          {poem.likes || 0}
                        </div>
                        <Link href={`/poems/${poem.id}`} className="text-xs text-blue-600 hover:underline mt-auto">Oku</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Top 3 Author */}
              <div className="bg-purple-50 rounded-2xl shadow-md p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4">TOP 3 ŞAİR</h2>
                <div className="flex flex-col gap-4">
                  {topPoets.length === 0 ? (
                    <div className="text-gray-500">Şair verisi yok.</div>
                  ) : (
                    topPoets.map(({ user, totalLikes }) => (
                      <div key={user.id} className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm group hover:scale-105 transition duration-300">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-200">
                          <Image src={user.image || "/default-avatar.png"} alt={user.name} width={56} height={56} className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500 mb-1">{user.bio}</div>
                          <div className="flex items-center gap-1 text-xs text-pink-600 font-semibold mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {totalLikes} toplam beğeni
                          </div>
                          <button className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded px-3 py-1 font-medium transition">Daha fazla</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Sidebar />
    </div>
  );
} 