"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CollectionsGrid from "@/components/poems/CollectionsGrid";

export default function CollectionsPage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Giriş Yapmanız Gerekiyor</h1>
            <p className="text-gray-600 mb-6">
              Koleksiyonlarınızı görüntülemek için lütfen hesabınıza giriş yapın.
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <DashboardHeader />
        
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-sm">
            <FiArrowLeft size={14} /> Panele Dön
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <main className="w-full lg:w-3/4">
            <div className="bg-white rounded-2xl shadow p-6">
              {isLoading ? (
                <div className="py-20 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Yükleniyor...</p>
                </div>
              ) : (
                <CollectionsGrid />
              )}
            </div>
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
