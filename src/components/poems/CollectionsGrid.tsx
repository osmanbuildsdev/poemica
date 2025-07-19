"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiPlus, FiTrash2, FiEdit2, FiFolder, FiGrid, FiLock, FiImage, FiLoader, FiChevronRight } from "react-icons/fi";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  poemCount: number;
}

export default function CollectionsGrid() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (session) {
      fetchCollections();
    }
  }, [session]);
  
  async function fetchCollections() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/collections?withCounts=true");
      
      if (!response.ok) {
        throw new Error("Koleksiyonlar yüklenemedi");
      }
      
      const data = await response.json();
      if (data.success) {
        setCollections(data.data);
      } else {
        setError(data.message || "Koleksiyonlar yüklenemedi");
      }
    } catch (error) {
      console.error("Koleksiyonlar yüklenirken hata:", error);
      setError("Koleksiyonlar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newCollectionName.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          isPrivate,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewCollectionName("");
        setNewCollectionDescription("");
        setIsPrivate(false);
        setShowCreateForm(false);
        

        fetchCollections();
      } else {
        setError(data.message || "Koleksiyon oluşturulamadı");
      }
    } catch (error) {
      console.error("Koleksiyon oluşturulurken hata:", error);
      setError("Koleksiyon oluşturulamadı");
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-800 mb-2">Koleksiyonları görmek için giriş yapın</h2>
        <p className="text-gray-500 mb-4">Şiirleri kaydetmek ve koleksiyonlar oluşturmak için hesabınıza giriş yapmalısınız.</p>
        <Link 
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Koleksiyonlarım</h2>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
        >
          <FiPlus size={16} />
          <span>Yeni Koleksiyon</span>
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Create Collection Form */}
      {showCreateForm && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Yeni Koleksiyon Oluştur</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
          
          <form onSubmit={handleCreateCollection}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Koleksiyon Adı*
              </label>
              <input
                type="text"
                id="name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Örn: Favori Aşk Şiirleri"
                maxLength={100}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Koleksiyon açıklaması (isteğe bağlı)"
                rows={3}
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="private" className="ml-2 text-sm text-gray-700">
                Özel Koleksiyon (sadece ben görebilirim)
              </label>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <FiPlus />
                    Koleksiyon Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Collections Grid */}
      {isLoading ? (
        <div className="py-12 text-center">
          <FiLoader className="animate-spin mx-auto text-blue-500" size={32} />
          <p className="mt-2 text-gray-500">Koleksiyonlar yükleniyor...</p>
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col border border-gray-100 group"
            >
              <div className="relative h-32 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                {collection.coverImage ? (
                  <Image
                    src={collection.coverImage}
                    alt={collection.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <FiGrid className="text-blue-300" size={48} />
                )}
                {collection.isPrivate && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <FiLock size={12} className="mr-1" />
                    Özel
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition mb-1">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 flex justify-between items-center mt-2">
                  <span>{collection.poemCount} şiir</span>
                  <span className="text-blue-600 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    Görüntüle <FiChevronRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-gray-100">
          <FiFolder className="mx-auto text-gray-300" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-800">Henüz koleksiyon oluşturmadınız</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Koleksiyonlar, şiirleri gruplamak ve düzenlemek için harika bir yoldur. Beğendiğiniz şiirleri kaydedin ve koleksiyonlara ekleyin.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-flex items-center gap-1"
          >
            <FiPlus />
            İlk Koleksiyonumu Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
