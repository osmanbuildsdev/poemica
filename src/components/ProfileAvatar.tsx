
import { useState, useEffect } from 'react';
import { getInitials, getAvatarColor, normalizeProfilePhotoPath } from "@/lib/avatarUtils";
import { appEvents } from "@/lib/events";

interface ProfileAvatarProps {
  user: {
    id?: string;
    name?: string | null;
    image?: string | null;
  };
  size?: "sm" | "md" | "lg";
  showEditOverlay?: boolean;
}

export default function ProfileAvatar({ 
  user, 
  size = "md",
  showEditOverlay = false
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(user.image);
  

  useEffect(() => {
    if (!user.id) return;
    
    const unsubscribe = appEvents.on('profile-updated', (event) => {
      if (event.type === 'profile-updated' && event.userId === user.id) {
        setCurrentImageUrl(event.newImage);
        setImageError(false);
      }
    });

    return unsubscribe;
  }, [user.id]);
  

  useEffect(() => {
    setCurrentImageUrl(user.image);
    setImageError(false);
  }, [user.image]);
  

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-24 h-24"
  };
  

  const fontSizeClasses = {
    sm: "text-sm",
    md: "text-xl", 
    lg: "text-3xl"
  };
  

  const handleImageError = () => {
    setImageError(true);
  };
  
  if (!user) return null;
  

  const normalizedImage = normalizeProfilePhotoPath(currentImageUrl);
  if (normalizedImage && !imageError) {
    return (
      <div className={`profile-avatar ${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 shadow-md relative`}>
        <img 
          src={`${normalizedImage}?v=${Date.now()}`}
          alt={user.name || "Profil"} 
          className="w-full h-full object-cover"
          loading="eager"
          onError={handleImageError}
        />
        
        {/* Edit overlay if requested */}
        {showEditOverlay && (
          <div className="opacity-0 hover:opacity-100 absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center transition-opacity">
            <span className="text-white text-xs flex flex-col items-center p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Değiştir
            </span>
          </div>
        )}
      </div>
    );
  }
  

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-gray-200 shadow-md`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${fontSizeClasses[size]} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5z" />
      </svg>
    </div>
  );
}
