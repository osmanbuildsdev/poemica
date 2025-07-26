"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-max mx-auto text-center">
          <div className="sm:flex items-center justify-center">
            <div className="sm:border-r sm:border-gray-200 sm:pr-10">
              <h1 className="text-6xl font-bold text-indigo-600 tracking-tight">404</h1>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-10 sm:text-left">
              <p className="text-xl font-medium text-gray-800">Sayfa bulunamadı</p>
              <p className="mt-2 text-base text-gray-600">
                Aradığınız sayfa mevcut değil veya bu sayfaya erişim izniniz yok.
              </p>
              <div className="mt-6 flex space-x-3 sm:border-l sm:border-transparent">
                <button 
                  onClick={() => router.back()}
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Geri Dön
                </button>
                <span className="inline-flex items-center text-gray-500">
                  <span className="h-4 w-px bg-gray-300" aria-hidden="true"></span>
                </span>
                <Link 
                  href="/"
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Ana Sayfaya Git
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
