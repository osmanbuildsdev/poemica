"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBookmark, FiFolder, FiList, FiGrid, FiFilter, FiLoader, FiX, FiSearch } from 'react-icons/fi';
import PoemCard from '@/components/poems/PoemCard';
import { toast } from 'react-hot-toast';

interface Poem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  coverImage?: string;
  likes: number;
  views: number;
  comments: number;
  tags?: string[];
  isSaved?: boolean;
  isRead?: boolean;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  coverImage: string | null;
  isPrivate: boolean;
  poemCount: number;
  createdAt: string;
}

export default function SavedPoemsPage() {
  const { data: session, status } = useSession();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPrivate: false
  });


  useEffect(() => {
    if (status === 'authenticated' && session) {
      loadSavedPoems();
      loadCollections();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, session]);

  async function loadSavedPoems() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/poems/saved');
      
      if (!response.ok) {
        throw new Error('Kaydedilen şiirler yüklenemedi');
      }
      
      const data = await response.json();
      if (data.success) {
        setPoems(Array.isArray(data.poems) ? data.poems : []);
      } else {
        setPoems([]);
        setError(data.message || 'Kaydedilen şiirler yüklenemedi');
      }
    } catch (error) {
      console.error('Kaydedilen şiirleri yüklerken hata:', error);
      setError('Kaydedilen şiirler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }
  async function loadCollections() {
    try {
      const response = await fetch('/api/collections?withCounts=true');
      
      if (!response.ok) {
        throw new Error('Koleksiyonlar yüklenemedi');
      }
      
      const data = await response.json();
      if (data.success) {

        setCollections(Array.isArray(data.collections) 
          ? data.collections 
          : Array.isArray(data.data)
            ? data.data
            : []
        );
      } else {
        console.error('Koleksiyonlar yüklenemedi:', data.message);
        setCollections([]);
      }
    } catch (error) {
      console.error('Koleksiyonlar yüklenirken hata:', error);
      setCollections([]);
    }
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    try {

      if (!newCollection.name.trim()) {
        toast.error('Koleksiyon adı boş olamaz');
        return;
      }
      
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCollection),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API yanıtı:', errorText);
        throw new Error('Koleksiyon oluşturulamadı');
      }
      
      const data = await response.json();
      if (data.success) {

        toast.success('Koleksiyon başarıyla oluşturuldu');
        

        loadCollections();
        

        setIsModalOpen(false);
        setNewCollection({
          name: '',
          description: '',
          isPrivate: false
        });
      } else {
        toast.error(data.message || 'Koleksiyon oluşturulamadı');
        console.error('Koleksiyon oluşturulamadı:', data.message);
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Tekrar deneyin.');
      console.error('Koleksiyon oluşturulurken hata:', error);
    }
  }

  const filteredPoems = poems.filter(poem => {

    const title = poem?.title || '';
    const content = poem?.content || '';
    const authorName = poem?.author?.name || '';
    

    const matchesSearch = searchTerm === '' || 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      authorName.toLowerCase().includes(searchTerm.toLowerCase());
    

    const matchesReadFilter = activeFilter === 'all' || (activeFilter === 'unread' && !poem.isRead);
    
    return matchesSearch && matchesReadFilter;
  });


  if (status === 'unauthenticated') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <FiBookmark className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Kayıt Ettiklerim</h1>
          <p className="text-gray-600 mb-6">Şiirleri kaydetmek ve koleksiyonlara eklemek için giriş yapmalısınız.</p>
          <Link 
            href="/login" 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kayıt Ettiklerim</h1>
          <p className="text-gray-600">
            Kaydettiğiniz şiirler ve koleksiyonlarınız burada bulunur.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setView('grid')}
            className={`p-2 rounded-md ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
          >
            <FiGrid size={18} />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-md ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
          >
            <FiList size={18} />
          </button>
        </div>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Şiir, şair veya içerik ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeFilter === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-md text-sm ${
              activeFilter === 'unread' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Okunmamış
          </button>
        </div>
      </div>      {/* Koleksiyonlar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Koleksiyonlarım</h2>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <FiFolder size={14} />
            <span>Yeni Koleksiyon</span>
          </button>
        </div>
        {collections.length === 0 ? (<div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FiFolder className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 mb-4">Henüz koleksiyon oluşturmadınız.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <FiFolder size={16} />
              <span>Yeni Koleksiyon Oluştur</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collections.map(collection => (
              <Link 
                key={collection.id}
                href={`/collections/${collection.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFolder 
                      size={18} 
                      className={collection.isPrivate ? "text-gray-400" : "text-blue-500"} 
                    />
                    <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {collection.name}
                    </h3>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{collection.description}</p>
                  )}
                  <div className="text-xs text-gray-400">
                    {collection.poemCount || 0} şiir • {
                      new Date(collection.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    }
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Kaydedilen Şiirler */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Kaydedilen Şiirler</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <FiLoader size={24} className="text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredPoems.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FiBookmark className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">
              {searchTerm || activeFilter !== 'all' 
                ? 'Aramanızla eşleşen kayıtlı şiir bulunamadı.' 
                : 'Henüz şiir kaydetmediniz.'}
            </p>
            <Link 
              href="/explore" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Şiirleri Keşfedin
            </Link>
          </div>
        ) : (
          <div className={view === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredPoems.map(poem => (
              <PoemCard 
                key={poem.id}
                poem={{
                  ...poem,
                  id: poem.id.toString(),
                  comments: poem.comments || 0
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Yeni Koleksiyon Oluşturma Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Yeni Koleksiyon Oluştur</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
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
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newCollection.isPrivate}
                    onChange={(e) => setNewCollection({...newCollection, isPrivate: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Özel Koleksiyon (Sadece sen görebilirsin)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
