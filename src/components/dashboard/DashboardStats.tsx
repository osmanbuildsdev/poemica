
"use client";
import { useEffect, useState } from "react";

export default function DashboardStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState({ poems: 0, followers: 0, following: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [poemsRes, followersRes, followingRes] = await Promise.all([
        fetch(`/api/users/${userId}/poems`),
        fetch(`/api/users/${userId}/followers`),
        fetch(`/api/users/${userId}/following`),
      ]);
      const poems = await poemsRes.json();
      const followers = await followersRes.json();
      const following = await followingRes.json();
      setStats({
        poems: poems.poems?.length || 0,
        followers: followers.followers?.length || 0,
        following: following.following?.length || 0,
      });
    }
    if (userId) fetchStats();
  }, [userId]);

  return (
    <div className="flex gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-[100px]">
        <span className="text-lg font-bold text-blue-600">{stats.poems}</span>
        <span className="text-xs text-gray-500 mt-1">Şiir</span>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-[100px]">
        <span className="text-lg font-bold text-blue-600">{stats.followers}</span>
        <span className="text-xs text-gray-500 mt-1">Takipçi</span>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-[100px]">
        <span className="text-lg font-bold text-blue-600">{stats.following}</span>
        <span className="text-xs text-gray-500 mt-1">Takip</span>
      </div>
    </div>
  );
}
