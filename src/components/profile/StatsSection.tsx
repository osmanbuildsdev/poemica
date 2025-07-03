import React, { memo, useEffect } from 'react';
import Link from 'next/link';




interface Stats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  mostViewedPoem: {
    id: string;
    title: string;
    views: number;
  } | null;
  mostLikedPoem: {
    id: string;
    title: string;
    likes: number;
  } | null;
  totalPoems: number;
  totalCollections: number;
  weeklyViews: number;
  weeklyLikes: number;
}

interface StatsSectionProps {
  stats: Stats;
  isOwnProfile: boolean;
}


export const StatsSection = memo(({ stats, isOwnProfile }: StatsSectionProps) => {


  if (!isOwnProfile) return null;

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-5">İçerik İstatistikleri</h2>
      
      {/* Main Stats - Simple row of cards */}
      <div className="flex flex-wrap gap-5 mb-8">
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-gray-800">{(stats?.totalPoems || 0).toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 mt-1">Şiir</span>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-gray-800">{(stats?.totalViews || 0).toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 mt-1">Görüntülenme</span>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-gray-800">{(stats?.totalLikes || 0).toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 mt-1">Beğeni</span>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-gray-800">{(stats?.totalComments || 0).toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 mt-1">Yorum</span>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-lg font-bold text-gray-800">{(stats?.totalCollections || 0).toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 mt-1">Koleksiyon</span>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Haftalık Görüntülenme</h3>
          <p className="text-lg font-bold text-gray-800">{(stats?.weeklyViews || 0).toLocaleString('tr-TR')}</p>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Haftalık Beğeni</h3>
          <p className="text-lg font-bold text-gray-800">{(stats?.weeklyLikes || 0).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Popular Content */}
      {(stats?.mostViewedPoem || stats?.mostLikedPoem) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">En Popüler İçerikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stats?.mostViewedPoem && (
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">En Çok Görüntülenen</span>
                </div>
                <Link href={`/poems/${stats.mostViewedPoem?.id}`} className="text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                  {stats.mostViewedPoem?.title || "İsimsiz Şiir"}
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  {(stats.mostViewedPoem?.views || 0).toLocaleString('tr-TR')} görüntülenme
                </div>
              </div>
            )}
            
            {stats?.mostLikedPoem && (
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">En Çok Beğenilen</span>
                </div>
                <Link href={`/poems/${stats.mostLikedPoem?.id}`} className="text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
                  {stats.mostLikedPoem?.title || "İsimsiz Şiir"}
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  {(stats.mostLikedPoem?.likes || 0).toLocaleString('tr-TR')} beğeni
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Son güncellenme bilgisi */}
      <div className="text-xs text-gray-400 mt-6 text-right">
        Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
      </div>
    </div>
  );
});
