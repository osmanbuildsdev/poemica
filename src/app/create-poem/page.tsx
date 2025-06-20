"use client";

import PoemForm from "@/components/poems/PoemForm";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreatePoemPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (poem: any) => {
    if (!session?.user?.email || !session?.user?.id) {
      throw new Error("Şiir paylaşmak için giriş yapmanız gerekiyor.");
    }

    try {
      const response = await fetch("/api/poems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-email": session.user.email,
          "x-auth-user-id": session.user.id,
        },
        body: JSON.stringify(poem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Şiir kaydedilemedi");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Şiir kaydetme hatası:", error);
      throw error;
    }
  };  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center w-full">
        {!session ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-yellow-800 mb-2">Giriş Yapmanız Gerekiyor</h2>
            <p className="text-yellow-700 mb-4">Şiir paylaşmak için lütfen giriş yapın.</p>
            <button 
              onClick={() => router.push('/login')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        ) : (
          <PoemForm onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
} 