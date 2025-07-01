
import { useEffect, useState } from 'react';
import { recordPoemView, recordPoemLike } from './userPreferences';

type PoemData = {
  id: number | string;
  tags?: string[];
  authorId?: string | number;
};

interface SavedPoemDetails {
  isArchived: boolean;
  isRead: boolean;
}


export function usePoemView(poem: PoemData | null, shouldRecord: boolean = true) {
  useEffect(() => {
    if (poem && shouldRecord) {

      const timer = setTimeout(() => {
        recordPoemView(poem.id, poem.tags, poem.authorId);

        markPoemAsRead(poem.id);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [poem, shouldRecord]);
}


export function handlePoemLike(poem: PoemData) {
  if (poem) {
    recordPoemLike(poem.id, poem.tags, poem.authorId);
  }
}


export function useSavedPoemStatus(poemId: number | string, refreshKey: number = 0) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<SavedPoemDetails | null>(null);

  useEffect(() => {
    async function checkSavedStatus() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/poems/${poemId}/save`);
        const data = await response.json();
        
        if (data.success) {
          setIsSaved(data.isSaved);
          setDetails(data.details);
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (poemId) {
      checkSavedStatus();
    }
  }, [poemId, refreshKey]);

  return { isSaved, isLoading, details };
}


export async function savePoem(poemId: number | string, isArchived: boolean = false) {
  try {
    const response = await fetch(`/api/poems/${poemId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived })
    });
    
    return await response.json();
  } catch (error) {
    console.error("Şiir kaydedilirken hata:", error);
    return { success: false, message: "Şiir kaydedilemedi" };
  }
}


export async function unsavePoem(poemId: number | string) {
  try {
    const response = await fetch(`/api/poems/${poemId}/save`, {
      method: 'DELETE'
    });
    
    return await response.json();
  } catch (error) {
    console.error("Şiir kaydı silinirken hata:", error);
    return { success: false, message: "Şiir kaydı silinemedi" };
  }
}


export async function markPoemAsRead(poemId: number | string) {
  try {
    const response = await fetch(`/api/poems/${poemId}/read`, {
      method: 'POST'
    });
    
    return await response.json();
  } catch (error) {
    console.error("Şiir okundu olarak işaretlenirken hata:", error);
    return { success: false };
  }
}


export async function markPoemAsUnread(poemId: number | string) {
  try {
    const response = await fetch(`/api/poems/${poemId}/read`, {
      method: 'DELETE'
    });
    
    return await response.json();
  } catch (error) {
    console.error("Şiir okunmadı olarak işaretlenirken hata:", error);
    return { success: false };
  }
}
