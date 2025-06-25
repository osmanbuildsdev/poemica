"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Poem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  coverImage?: string;
  tags?: string[];
}

export default function EditPoemPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    async function fetchPoem() {
      try {
        const response = await fetch(`/api/poems/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const poemData = data.poem;
          

          if (session?.user?.id !== poemData.authorId) {
            alert("Bu şiiri düzenleme yetkiniz yok.");
            router.push("/dashboard");
            return;
          }
          
          setPoem(poemData);
          setTitle(poemData.title);
          setContent(poemData.content);
          setTags(poemData.tags ? poemData.tags.join(", ") : "");
        } else {
          alert("Şiir bulunamadı.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Şiir yüklenirken hata:", error);
        alert("Şiir yüklenirken hata oluştu.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchPoem();
    }
  }, [params.id, session?.user?.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert("Başlık ve içerik alanları zorunludur.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/poems/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-email": session?.user?.email || "",
          "x-auth-user-id": session?.user?.id || "",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Şiir başarıyla güncellendi.");
        router.push(`/poems/${params.id}`);
      } else {
        alert(data.error || "Şiir güncellenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Şiir güncellenirken hata:", error);
      alert("Şiir güncellenirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Şiir yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!poem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Şiiri Düzenle</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Şiirinizin başlığını girin..."
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                İçerik
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Şiirinizi buraya yazın..."
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler (virgülle ayırın)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="aşk, doğa, hüzün..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
