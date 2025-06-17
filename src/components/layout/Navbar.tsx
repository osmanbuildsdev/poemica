"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { getInitials, getAvatarColor, normalizeProfilePhotoPath } from "@/lib/avatarUtils";
import MobileMenuAvatar from "./MobileMenuAvatar";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useRouter } from "next/navigation";
import { appEvents } from "@/lib/events";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const user = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const unsubscribeProfileUpdate = appEvents.on('profile-updated', (event) => {
      if (event.type === 'profile-updated' && event.userId === user?.id) {

        setRefreshKey(prev => prev + 1);
        

        updateSession({
          image: event.newImage,
          name: event.newName,
          imageCacheBuster: Date.now()
        });
      }
    });

    const unsubscribeSessionRefresh = appEvents.on('session-refresh', () => {

      updateSession();
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      unsubscribeProfileUpdate();
      unsubscribeSessionRefresh();
    };
  }, [user?.id, updateSession]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image 
                src="/poemica-logo.png" 
                alt="Poemica" 
                width={120} 
                height={32} 
                className="h-8 w-auto"
                priority
              />
            </Link>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link 
                href="/feed" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
              >
                Akış
              </Link>
              <Link 
                href="/random" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
              >
                Rastgele
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
                >
                  Şiirlerim
                </Link>
              )}
              <Link 
                href="/explore" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
              >
                Keşfet
              </Link>
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="relative" ref={profileRef}>                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >                  {
                  }                  <ProfileAvatar 
                    key={`navbar-avatar-${refreshKey}`}
                    user={{
                      id: user.id,
                      name: user.name ?? undefined,
                      image: user.image ?? undefined
                    }}
                    size="sm"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {user.name}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`ml-1 h-4 w-4 text-gray-400 inline-block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>                      <Link href={`/profile/${user.id}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profil
                        </div>
                      </Link>
                      
                      <Link href="/create-poem" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Yeni Şiir Ekle
                        </div>
                      </Link>
                      
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Şiirlerim
                        </div>
                      </Link>
                      
                      <Link href="/saved-poems" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          Kaydedilenler
                        </div>
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Çıkış Yap
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Kaydol
                </Link>
              </div>
            )}
          </div>

          {/* Mobil menü butonu */}
          <div className="flex items-center sm:hidden">
            <Dialog.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="sr-only">Menüyü aç</span>
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Menü
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="rounded-md text-gray-400 hover:text-gray-500">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="sr-only">Kapat</span>
                      </button>
                    </Dialog.Close>
                  </div>
                    {user && (
                    <div className="px-4 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <MobileMenuAvatar user={user} />
                        <div>
                          <p className="text-base font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  
                  <div className="py-2 px-2 space-y-1">
                    <Link
                      href="/feed"
                      className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Akış
                    </Link>
                    
                    {user && (
                      <>                        <Link
                          href={`/profile/${user.id}`}
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profil
                          </div>
                        </Link>
                        
                        <Link
                          href="/dashboard"
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Şiirlerim
                        </div>
                      </Link>
                      
                      <Link
                          href="/create-poem"
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Yeni Şiir Ekle
                          </div>
                        </Link>
                        
                        <Link
                          href="/saved-poems"
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Kaydedilenler
                          </div>
                        </Link>
                      </>
                    )}
                    
                    <Link
                      href="/explore"
                      className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Keşfet
                    </Link>
                    
                    {user ? (
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Çıkış Yap
                        </div>
                      </button>
                    ) : (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          href="/login"
                          className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          href="/register"
                          className="block mt-2 mx-3 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-center transition-colors shadow-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Kaydol
                        </Link>
                      </>
                    )}
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>
    </div>
  );
}