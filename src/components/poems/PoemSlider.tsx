import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export type PoemSliderPoem = {
  id: number;
  title: string;
  coverImage?: string | null;
  content?: string;
};

export default function PoemSlider({ poems }: { poems: PoemSliderPoem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalMs = 4000;

  useEffect(() => {
    if (poems.length < 2) return;
    const interval = setInterval(() => {
      handleNext();
    }, intervalMs);
    return () => clearInterval(interval);

  }, [poems, activeIdx]);

  const handlePrev = () => {
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev - 1 + poems.length) % poems.length);
      setAnimating(false);
    }, 250);
  };

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % poems.length);
      setAnimating(false);
    }, 250);
  };

  const activePoem = poems[activeIdx];

  return (
    <section className="w-full py-12 px-2 sm:px-0">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
        {/* Left: Poem Info */}
        <div className="flex-1 max-w-md text-center md:text-left flex flex-col justify-center items-center md:items-start">
          {activePoem && (
            <>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 leading-tight line-clamp-2">
                {activePoem.title}
              </h2>
              {activePoem.content && (
                <div className="mb-6 text-gray-600 text-base sm:text-lg font-mono whitespace-pre-line">
                  {activePoem.content.split("\n").slice(0, 4).map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}
              <Link href={`/poems/${activePoem.id}`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-all text-lg">
                  Daha fazla oku
                </button>
              </Link>
            </>
          )}
        </div>
        {/* Right: Big Cover Image with animation */}
        <div className="flex-1 flex justify-center items-center relative min-h-[320px]">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-2 shadow transition-all"
            onClick={handlePrev}
            aria-label="Önceki şiir"
          >
            <FiChevronLeft className="w-7 h-7" />
          </button>
          <div
            className={`relative w-64 h-80 sm:w-80 sm:h-96 rounded-3xl shadow-xl border-4 border-white overflow-hidden bg-gray-100 transition-all duration-500 ${
              animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            key={activePoem?.id}
          >
            {activePoem && activePoem.coverImage ? (
              <Image
                src={activePoem.coverImage}
                alt={activePoem.title}
                fill
                className="object-cover object-center"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                No Image
              </div>
            )}
          </div>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-blue-100 text-blue-600 rounded-full p-2 shadow transition-all"
            onClick={handleNext}
            aria-label="Sonraki şiir"
          >
            <FiChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>
      {/* Altında küçük noktalar ile hangi şiirin aktif olduğunu göster */}
      <div className="flex justify-center mt-6 gap-2">
        {poems.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              idx === activeIdx ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => setActiveIdx(idx)}
            aria-label={`Şiir ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 