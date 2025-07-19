"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FiFolder, FiGrid, FiEdit2, FiTrash2, FiLock, FiX, FiLoader, FiArrowLeft } from "react-icons/fi";
import PoemCard from "@/components/poems/PoemCard";

type Collection = {
  id: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};

type Poem = {
  id: number;
  title: string;
  content: string;
  coverImage: string | null;
  authorId: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  likes: number;
  views: number;
  comments?: number;
  recommends?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  addedAt?: string;
};

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const collectionId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  

  useEffect(() => {
    async function fetchCollectionData() {
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }
      
      if (status === "loading" || !collectionId) return;
      
      setLoading(true);
      setError(null);
      
      try {

        const collectionRes = await fetch(`/api/collections/${collectionId}`);
        
        if (!collectionRes.ok) {
          if (collectionRes.status === 404) {
            throw new Error("Koleksiyon bulunamadı");
          } else if (collectionRes.status === 403) {
            throw new Error("Bu koleksiyonu görüntüleme izniniz yok");
          } else {
            throw new Error("Koleksiyon bilgileri yüklenemedi");
          }
        }
        
        const collectionData = await collectionRes.json();
        
        if (!collectionData.success) {
          throw new Error(collectionData.message || "Koleksiyon bilgileri yüklenemedi");
        }
        
        setCollection(collectionData.data);
        

        const poemsRes = await fetch(`/api/collections/${collectionId}/poems`);
        
        if (!poemsRes.ok) {
          throw new Error("Koleksiyon içerikleri yüklenemedi");
        }
        
        const poemsData = await poemsRes.json();
        
        if (!poemsData.success) {
          throw new Error(poemsData.message || "Koleksiyon içerikleri yüklenemedi");
        }
        
        setPoems(poemsData.data || []);
      } catch (err) {
        console.error("Koleksiyon verisi yüklenirken hata:", err);
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCollectionData();
  }, [collectionId, status, router]);
  

  async function handleDeleteCollection() {
    if (!collection || !collectionId) return;
    
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Koleksiyon silinemedi");
      }
      

      router.push("/dashboard");
      
    } catch (err) {
      console.error("Koleksiyon silinirken hata:", err);
      setError(err instanceof Error ? err.message : "Koleksiyon silinemedi");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }
  

  async function handleRemovePoemFromCollection(poemId: number) {
    if (!collectionId) return;
    
    try {
      const response = await fetch(`/api/collections/${collectionId}/poems/${poemId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Şiir koleksiyondan çıkarılamadı");
      }
      

      setPoems(poems.filter(poem => poem.id !== poemId));
      
    } catch (err) {
      console.error("Şiir koleksiyondan çıkarılırken hata:", err);
      setError(err instanceof Error ? err.message : "Şiir koleksiyondan çıkarılamadı");
    }
  }
  

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-500 mt-2">Koleksiyon yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={() => router.back()} className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                <FiArrowLeft size={14} /> Geri Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  if (!collection) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
          <p className="text-yellow-700">Koleksiyon bulunamadı</p>
          <button onClick={() => router.back()} className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1">
            <FiArrowLeft size={14} /> Geri Dön
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-2">
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-sm">
          <FiArrowLeft size={14} /> Tüm Koleksiyonlar
        </Link>
      </div>
      
      {/* Collection Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Collection Cover */}
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {collection.coverImage ? (
              <Image
                src={collection.coverImage}
                alt={collection.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <FiFolder className="text-blue-500" size={32} />
            )}
          </div>
          
          {/* Collection Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
              {collection.isPrivate && (
                <div className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                  <FiLock size={10} />
                  Özel
                </div>
              )}
            </div>
            
            {collection.description && (
              <p className="text-gray-600 mt-1">{collection.description}</p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>{poems.length} şiir</span>
              <span>·</span>
              <span>Oluşturulma: {new Date(collection.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link 
              href={`/collections/${collectionId}/edit`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            >
              <FiEdit2 size={18} />
            </Link>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Poems in collection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-1">
          <FiGrid size={18} className="text-blue-500" />
          Koleksiyondaki Şiirler
        </h2>
        
        {poems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poems.map((poem) => (
              <div key={poem.id} className="relative group">
                <button
                  onClick={() => handleRemovePoemFromCollection(poem.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition z-10"
                  title="Koleksiyondan çıkar"
                >
                  <FiX size={16} />
                </button>
                <PoemCard poem={{
                  ...poem,
                  id: String(poem.id),
                  comments: 0,
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <FiFolder className="text-gray-300 mx-auto mb-3" size={40} />
            <h3 className="text-gray-500 text-lg font-medium">Bu koleksiyon boş</h3>
            <p className="text-gray-400 mt-1 mb-4">
              Henüz bu koleksiyona eklenmiş şiir bulunmuyor
            </p>
            <Link
              href="/explore"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Şiirleri Keşfet
            </Link>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          ></div>
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Koleksiyonu Sil</h3>
              <p className="text-gray-600 mb-4">
                "{collection.name}" koleksiyonunu silmek istediğinize emin misiniz?
                Bu işlem geri alınamaz ve koleksiyondaki şiirlere olan bağlantılar kaybolacaktır.
                Şiirler silinmeyecek, sadece koleksiyondan çıkacaktır.
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                >
                  İptal
                </button>
                
                <button
                  onClick={handleDeleteCollection}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      Koleksiyonu Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
