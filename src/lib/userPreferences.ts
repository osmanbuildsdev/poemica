


export interface UserPreferences {
  favoriteTags?: Record<string, number>;
  recentlyViewed?: string[];
  interactionHistory?: Record<string, number>;
  lastSidebarRefresh?: number;
  savedCollections?: number[];
}


const isBrowser = () => typeof window !== 'undefined';


export const interactionEvents = {
  callbacks: new Set<Function>(),
  subscribe(callback: Function) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  },
  notify(interactionType: string, poemId: number | string, authorId?: string | number) {
    this.callbacks.forEach(callback => callback(interactionType, poemId, authorId));
  }
};


export async function recordPoemView(poemId: number | string, tags?: string[], authorId?: string | number) {
  if (!isBrowser()) return;
  
  try {

    const recentlyViewed = localStorage.getItem('poemica_recently_viewed');
    const recentPoems = recentlyViewed ? JSON.parse(recentlyViewed) : [];
    

    const filteredPoems = recentPoems.filter((id: number | string) => id !== poemId);
    

    const newRecentPoems = [poemId, ...filteredPoems].slice(0, 20);
    localStorage.setItem('poemica_recently_viewed', JSON.stringify(newRecentPoems));
    

    if (tags && tags.length > 0) {
      const tagsHistory = localStorage.getItem('poemica_favorite_tags');
      const favoriteTags: Record<string, number> = tagsHistory ? JSON.parse(tagsHistory) : {};
      

      tags.forEach(tag => {
        favoriteTags[tag] = (favoriteTags[tag] || 0) + 1;
      });
      
      localStorage.setItem('poemica_favorite_tags', JSON.stringify(favoriteTags));
    }
    

    if (authorId) {
      const interactionHistory = localStorage.getItem('poemica_interactions');
      const interactions = interactionHistory ? JSON.parse(interactionHistory) : {};
      
      const authorKey = `author_${authorId}`;
      interactions[authorKey] = (interactions[authorKey] || 0) + 1;
      
      localStorage.setItem('poemica_interactions', JSON.stringify(interactions));
    }


    const viewResponse = await fetch(`/api/poems/${poemId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (viewResponse.ok) {

      interactionEvents.notify('view', poemId, authorId);
    }

  } catch (error) {
    console.error('Error recording poem view:', error);
  }
}


export async function recordPoemLike(poemId: number | string, tags?: string[], authorId?: string | number) {
  if (!isBrowser()) return;
  
  try {

    if (authorId) {
      const interactionHistory = localStorage.getItem('poemica_interactions');
      const interactions = interactionHistory ? JSON.parse(interactionHistory) : {};
      
      const authorLikeKey = `author_like_${authorId}`;
      interactions[authorLikeKey] = (interactions[authorLikeKey] || 0) + 1;
      
      localStorage.setItem('poemica_interactions', JSON.stringify(interactions));
    }


    const likeResponse = await fetch(`/api/poems/${poemId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (likeResponse.ok) {

      interactionEvents.notify('like', poemId, authorId);
    }
    
  } catch (error) {
    console.error('Error recording poem like:', error);
  }
}


export function getFavoriteTags(limit: number = 5): string[] {
  if (!isBrowser()) return [];
  
  try {
    const tagsHistory = localStorage.getItem('poemica_favorite_tags');
    if (!tagsHistory) return [];
    
    const favoriteTags: Record<string, number> = JSON.parse(tagsHistory);
    

    return Object.entries(favoriteTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  } catch (error) {
    console.error("Error getting favorite tags:", error);
    return [];
  }
}


export function getUserPreferences(): UserPreferences {
  if (!isBrowser()) {

    return {
      favoriteTags: {},
      recentlyViewed: [],
      interactionHistory: {},
      lastSidebarRefresh: Date.now(),
      savedCollections: []
    };
  }
  
  try {

    const tagsHistory = localStorage.getItem('poemica_favorite_tags');
    const favoriteTags = tagsHistory ? JSON.parse(tagsHistory) : {};
    

    const recentlyViewed = localStorage.getItem('poemica_recently_viewed');
    const recentPoems = recentlyViewed ? JSON.parse(recentlyViewed) : [];
    

    const interactionHistory = localStorage.getItem('poemica_interactions');
    const interactions = interactionHistory ? JSON.parse(interactionHistory) : {};
    

    const userPref = localStorage.getItem('userPreferences');
    const storedPrefs = userPref ? JSON.parse(userPref) : {};
    
    return {
      favoriteTags,
      recentlyViewed: recentPoems,
      interactionHistory: interactions,
      lastSidebarRefresh: storedPrefs.lastSidebarRefresh || Date.now(),
      savedCollections: storedPrefs.savedCollections || []
    };
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return {
      favoriteTags: {},
      recentlyViewed: [],
      interactionHistory: {},
      lastSidebarRefresh: Date.now(),
      savedCollections: []
    };
  }
}
