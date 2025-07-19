"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiPlus, FiTrash2, FiEdit2, FiFolderPlus, FiFolder, FiX, FiLoader, FiSettings, FiLock } from "react-icons/fi";

interface Collection {
  id: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  poemCount?: number;
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (poemId: number, collectionId: number) => void;
  poemId: number;
  isCreateOnly?: boolean;
}

export default function CollectionModal({ isOpen, onClose, onSave, poemId, isCreateOnly = false }: CollectionModalProps) {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(isCreateOnly);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (isOpen && session) {
      fetchCollections();
    }
  }, [isOpen, session]);


  async function fetchCollections() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/collections?withCounts=true");
      if (!response.ok) throw new Error("Koleksiyonlar yüklenemedi");
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
      setError("Koleksiyon adı boş olamaz");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription || null,
          isPrivate: isPrivate,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {

        setNewCollectionName("");
        setNewCollectionDescription("");
        setIsPrivate(false);
        setShowCreateForm(false);
        

        await fetchCollections();
        

        if (data.collection?.id) {
          handleAddToCollection(data.collection.id);
        }
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


  async function handleAddToCollection(collectionId: number) {
    try {
      const response = await fetch(`/api/collections/${collectionId}/poems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
      });
      
      const data = await response.json();
      if (data.success) {
        onSave(poemId, collectionId);
        onClose();
      } else {
        setError(data.message || "Şiir koleksiyona eklenemedi");
      }
    } catch (error) {
      console.error("Şiir koleksiyona eklenirken hata:", error);
      setError("Şiir koleksiyona eklenemedi");
    }
  }

  if (!isOpen) return null;
  return (
    <div className={`${isCreateOnly ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center' : 'absolute top-full right-0 mt-2'}`}>
      <div className={`${isCreateOnly ? 'w-80 md:w-96' : 'w-72'} bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden`}>
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="font-medium text-gray-700">{isCreateOnly ? "Koleksiyon Oluştur" : "Koleksiyona Ekle"}</div>
        </div>
        <div className="p-3">
          {error && (
            <div className="text-sm text-red-500 mb-3">
              {error}
            </div>
          )}
          {/* Yeni Koleksiyon Oluştur */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
            >
              <FiFolderPlus size={16} />
              <span>Yeni Koleksiyon</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCollection} className="mb-3 bg-blue-50 p-3 rounded-md">
              <div className="mb-2">
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                  Koleksiyon Adı*
                </label>
                <input
                  id="name"
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Koleksiyon adı"
                  required
                />
              </div>
              <div className="mb-2">
                <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <input
                  id="description"
                  type="text"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="İsteğe bağlı açıklama"
                />
              </div>
              <div className="mb-2 flex items-center">
                <input
                  id="private"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="private" className="ml-2 text-xs text-gray-700">
                  Özel Koleksiyon
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="animate-spin" size={12} />
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={12} />
                      <span>Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          {/* Koleksiyonlar Listesi */}
          {isLoading ? (
            <div className="flex justify-center py-3">
              <FiLoader className="animate-spin text-blue-600" size={18} />
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleAddToCollection(collection.id)}
                  className="w-full flex items-center gap-2 p-2 text-sm hover:bg-gray-50 rounded-md transition group"
                >
                  <FiFolder size={16} className="text-blue-500" />
                  <span className="text-gray-700">{collection.name}</span>
                  {collection.isPrivate && (
                    <FiLock size={14} className="ml-auto text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Kapat Butonu */}
        <div className="p-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
