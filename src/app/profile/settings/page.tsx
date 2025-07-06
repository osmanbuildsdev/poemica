"use client";

import { useState, useEffect } from "react";
import { useAuthStatus } from "@/lib/hooks";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getInitials, getAvatarColor, refreshUserAvatars, normalizeProfilePhotoPath } from "@/lib/avatarUtils";
import ProfileAvatar from "@/components/ProfileAvatar";
import { emitProfileUpdated, emitSessionRefresh } from "@/lib/events";

export default function ProfileSettingsPage() {
  const { session, isAuthenticated } = useAuthStatus();

  const { update: updateSession } = useSession();
  
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: (session?.user as any)?.bio || "",
    location: (session?.user as any)?.location || "",
    websiteUrl: (session?.user as any)?.websiteUrl || ""
  });
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(session?.user?.image || null);
  const [uploadLoading, setUploadLoading] = useState(false);
  

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        email: session.user.email || "",
        bio: (session.user as any)?.bio || "",
        location: (session.user as any)?.location || "",
        websiteUrl: (session.user as any)?.websiteUrl || ""
      });
      setPreviewUrl(session.user.image || null);
    }
  }, [session]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      

      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Lütfen bir resim dosyası seçin');
        return;
      }
      

      if (selectedFile.size > 3 * 1024 * 1024) {
        toast.error('Profil fotoğrafı boyutu 3MB\'dan küçük olmalıdır');
        return;
      }
      
      setImage(selectedFile);
      

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleImageUpload = async () => {
    if (!image) return;
    
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('file', image);
      formData.append('type', 'profile');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Profil fotoğrafı yüklenemedi');
      }
      
      const data = await response.json();
      
      if (data.success && data.url) {

        const normalizedUrl = normalizeProfilePhotoPath(data.url);
        const previewWithCache = `${normalizedUrl}?t=${Date.now()}`;
        setPreviewUrl(previewWithCache);
        return normalizedUrl;
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error('Profil fotoğrafı yüklenirken bir hata oluştu');
      return null;
    } finally {
      setUploadLoading(false);
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {

      let imageUrl = null;
      if (image) {
        imageUrl = await handleImageUpload();
      }

      const updatedForm = imageUrl ? { ...form, image: normalizeProfilePhotoPath(imageUrl) } : form;
      
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm)
      });
      
      if (!res.ok) {
        toast.error("Profil güncellenemedi");
        setLoading(false);
        return;
      }
      

      const userData = await res.json();
      

      const timestamp = Date.now();      const newImage = imageUrl ? `${normalizeProfilePhotoPath(imageUrl)}?t=${timestamp}` : session?.user?.image;
      

      await updateSession({
        image: newImage,
        name: form.name,
        imageCacheBuster: timestamp
      });
      
      setPreviewUrl(newImage ?? null);
      

      if (session?.user?.id) {
        emitProfileUpdated(
          session.user.id,
          newImage,
          form.name
        );
      }
      

      emitSessionRefresh();
      

      setTimeout(() => {
        refreshUserAvatars();
        

        updateSession({
          image: newImage,
          name: form.name,
          imageCacheBuster: Date.now()
        });
      }, 100);
      
      toast.success("Profil başarıyla güncellendi");
    } catch (err) {
      toast.error("Bir hata oluştu");
      console.error("Profil güncelleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center text-red-600">Giriş yapmalısınız.</div>;
  }
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Hesap / Profil Ayarları</h1>
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow">
        {/* Profil Resmi Alanı */}
        <div id="profile-image" className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profil Fotoğrafı</h2>          <div className="flex items-center">
            <div className="flex-shrink-0 mr-6">
              {previewUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                  <img 
                    src={`${previewUrl}?v=${Date.now()}`}
                    alt="Profil önizleme" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <ProfileAvatar 
                  user={{
                    name: session?.user?.name,
                    image: session?.user?.image
                  }}
                  size="lg"
                />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col space-y-3">
                <label className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 transition shadow-sm">
                  <span>Fotoğraf Seç</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
                
                {image && (
                  <p className="text-xs text-gray-500">
                    Seçilen dosya: {image.name} ({(image.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                
                <p className="text-xs text-gray-500">
                  JPG, PNG veya GIF. Maksimum 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            required
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
          <input
            type="text"
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="https://..."
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
