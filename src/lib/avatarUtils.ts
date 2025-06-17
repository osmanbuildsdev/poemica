"use client";

/**
 * Avatar utilities for consistently rendering user avatars across the application
 */

/**
 * Gets the initials from a user's name (up to 2 characters)
 */
export function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Gets a consistent color class based on user name
 * Returns one of the predefined color classes
 */
export function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-violet-500",
  ];
  

  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charCodeSum % colors.length];
}

/**
 * Gets a URL with cache-busting timestamp for profile photos
 */
export function getImageUrlWithCacheBusting(url: string | null | undefined) {
  if (!url) return null;
  

  const baseUrl = url.split('?')[0];
  

  const timestamp = Date.now();
  return `${baseUrl}?t=${timestamp}`;
}

/**
 * Cleans up profile photo path and ensures it starts with /images/profile/
 */
export function normalizeProfilePhotoPath(url: string | null | undefined) {
  if (!url) return null;
  

  if (url.startsWith('/images/profile/')) return url;
  

  if (url.startsWith('/uploads/')) {
    const filename = url.split('/').pop();
    return `/images/profile/${filename}`;
  }
  
  return url;
}

/**
 * Component props for consistent avatar implementation
 */
export interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Helper to prevent avatar images from being stale across the app
 */
export function refreshUserAvatars() {

  const timestamp = Date.now();
  document.querySelectorAll('.profile-avatar img').forEach((img: any) => {

    const src = img.src.split('?')[0];

    img.src = `${src}?v=${timestamp}`;
  });
}
