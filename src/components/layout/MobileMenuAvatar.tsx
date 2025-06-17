
import { useState } from "react";
import { normalizeProfilePhotoPath } from "@/lib/avatarUtils";

interface MobileMenuAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export default function MobileMenuAvatar({ user }: MobileMenuAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const renderAvatar = () => {
    const normalizedImage = normalizeProfilePhotoPath(user.image);
    if (normalizedImage && !imageError) {
      return (
        <div className="profile-avatar w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-md">
          <img
            src={`${normalizedImage}?v=${Date.now()}`}
            alt={user.name || "Profil"}
            className="w-full h-full object-cover"
            loading="eager"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="text-xl text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-3">
      {renderAvatar()}
    </div>
  );
}
