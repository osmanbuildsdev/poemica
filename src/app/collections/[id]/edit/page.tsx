"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiFolder, FiLoader, FiLock, FiUnlock, FiImage, FiX } from "react-icons/fi";

type Collection = {
  id: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function EditCollectionPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const collectionId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  

  useEffect(() => {
    async function fetchCollection() {
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }
      
      if (status === "loading" || !collectionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/collections/${collectionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Koleksiyon bulunamadı");
          } else if (response.status === 403) {
            throw new Error("Bu koleksiyonu düzenleme izniniz yok");
          } else {
            throw new Error("Koleksiyon bilgileri yüklenemedi");
          }
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Koleksiyon bilgileri yüklenemedi");
        }
        
        const collection: Collection = data.data;
        

        setName(collection.name);
        setDescription(collection.description || "");
        setIsPrivate(collection.isPrivate);
        setCoverImage(collection.coverImage);
        
      } catch (err) {
        console.error("Koleksiyon verisi yüklenirken hata:", err);
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCollection();
  }, [collectionId, status, router]);
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Koleksiyon adı zorunludur");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          isPrivate,
          coverImage,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Koleksiyon güncellenemedi");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Koleksiyon güncellenemedi");
      }
      
      setSuccess("Koleksiyon başarıyla güncellendi");
      

      setTimeout(() => {
        router.push(`/collections/${collectionId}`);
      }, 1500);
      
    } catch (err) {
      console.error("Koleksiyon güncellenirken hata:", err);
      setError(err instanceof Error ? err.message : "Koleksiyon güncellenemedi");
    } finally {
      setIsSaving(false);
    }
  }
  

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Koleksiyon kapak resmi 5MB'dan küçük olmalıdır");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Resim yüklenemedi");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Resim yüklenemedi");
      }
      
      setCoverImage(data.url);
    } catch (err) {
      console.error("Resim yüklenirken hata:", err);
      setError(err instanceof Error ? err.message : "Resim yüklenemedi");
    } finally {
      setIsSaving(false);
    }
  }
  

  function handleRemoveCoverImage() {
    setCoverImage(null);
  }
  

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-500 mt-2">Koleksiyon bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/collections/${collectionId}`} className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-sm">
          <FiArrowLeft size={14} /> Koleksiyona Dön
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Koleksiyonu Düzenle</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Koleksiyon Adı*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Koleksiyon Adı"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Açıklama
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Koleksiyonunuz hakkında kısa bir açıklama"
            rows={3}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kapak Görseli
          </label>
          
          {coverImage ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
              <Image
                src={coverImage}
                alt="Koleksiyon kapağı"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={handleRemoveCoverImage}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-500 hover:text-red-600"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-2">
              <FiImage className="text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500">Kapak görseli eklemek için tıklayın</p>
            </div>
          )}
          
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="coverImage"
            className="mt-2 inline-block px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 cursor-pointer"
          >
            {coverImage ? "Görseli değiştir" : "Görsel yükle"}
          </label>
        </div>
        
        <div className="mb-8 flex items-center">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <label htmlFor="private" className="ml-2 text-sm text-gray-700 flex items-center">
            {isPrivate ? (
              <>
                <FiLock className="mr-1 text-amber-500" size={14} /> Özel Koleksiyon (sadece sen görebilirsin)
              </>
            ) : (
              <>
                <FiUnlock className="mr-1 text-green-500" size={14} /> Herkese Açık Koleksiyon
              </>
            )}
          </label>
        </div>
        
        <div className="flex justify-between">
          <Link
            href={`/collections/${collectionId}`}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            İptal
          </Link>
          
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                Kaydediliyor...
              </>
            ) : (
              "Değişiklikleri Kaydet"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
