import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiEye, FiMessageSquare } from 'react-icons/fi';
import PoemActions from './PoemActions';

interface PoemCardProps {
  poem: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    likes: number;
    views: number;
    comments: number;
    coverImage?: string | null;
  };
}

export default function PoemCard({ poem }: PoemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {/* Şiir kaydedildi ikonu - sağ üst köşe */}
      <div className="absolute top-2 right-2 z-10">
        <PoemActions poemId={poem.id} variant="icon" />
      </div>        {poem.coverImage && (
        <Link href={`/poems/${poem.id}`} className="block">
          <div className="relative w-full h-48">
            <Image
              src={poem.coverImage}
              alt={poem.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized              onLoad={() => {

              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                

                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                      <span class="text-3xl font-serif text-gray-300 italic">${poem.title.charAt(0)}</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
        </Link>
      )}

      <div className="p-6">
        <Link href={`/poems/${poem.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {poem.title}
          </h3>
        </Link>
        <Link href={`/poems/${poem.id}`}>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {poem.content}
          </p>
        </Link>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <Link href={`/profile/${poem.author.id}`} className="font-medium text-gray-700 hover:underline">
            {poem.author.name}
          </Link>            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FiHeart className="w-4 h-4 mr-1" />
                <span>{poem.likes}</span>
              </div>
              <div className="flex items-center">
                <FiEye className="w-4 h-4 mr-1" />
                <span>{poem.views}</span>
              </div>
              <div className="flex items-center">
                <FiMessageSquare className="w-4 h-4 mr-1" />
                <span>{poem.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}