"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PoemList from "@/components/poems/PoemList";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardActions from "@/components/dashboard/DashboardActions";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";


function DashboardContent() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  

  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  const [tag, setTag] = useState<string | undefined>(tagParam || undefined);
  

  useEffect(() => {
    setTag(tagParam || undefined);
  }, [tagParam]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <DashboardHeader />
        <div className="flex flex-col lg:flex-row gap-6">
          <main className="w-full lg:w-3/4">
            {userId && <DashboardStats userId={userId} />}
            <DashboardActions />            <div className="bg-white rounded-2xl shadow p-6 mt-4">
              <PoemList tag={tag} showOnlyUserPoems={true} />            </div>
          </main>
          <aside className="w-full lg:w-1/4 hidden lg:block">
            <div className="sticky top-4">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 gap-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}