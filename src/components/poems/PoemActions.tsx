"use client";

import { useState } from "react";
import { FiBookmark, FiCheckCircle, FiX, FiArchive, FiEye, FiRefreshCw, FiGrid } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useSavedPoemStatus, savePoem, unsavePoem, markPoemAsRead, markPoemAsUnread } from "@/lib/poemInteractions";
import CollectionModal from "./CollectionModal";
import { motion } from "framer-motion";

interface PoemActionsProps {
  poemId: number | string;
  showReadStatus?: boolean;
  variant?: "inline" | "dropdown" | "icon";
  onStatusChange?: () => void;
}

export default function PoemActions(props: PoemActionsProps) {
  const {
    poemId,
    showReadStatus = true,
    variant = "dropdown",
    onStatusChange,
  } = props;

  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isSaved, isLoading, details } = useSavedPoemStatus(poemId, refreshKey);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);


  if (!session || isLoading) {
    return (
      <button disabled className="flex items-center px-4 py-2 rounded-md font-medium text-sm bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed">
        <FiBookmark size={16} className="mr-2" />
        Kaydet
      </button>
    );
  }

  const isRead = details?.isRead || false;
  const isArchived = details?.isArchived || false;


  const handleButtonClick = () => {
    if (isSaved) {

      handleUnsave();
    } else {

      setShowCollectionModal(true);
    }
  };


  async function handleUnsave() {
    try {
      setIsUpdating(true);
      const result = await unsavePoem(poemId);
      

      if (result && result.success) {


      }
      
      setRefreshKey((k) => k + 1);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Şiir kaydı kaldırılırken hata:", error);
    } finally {
      setIsUpdating(false);
    }
  }


  async function handleSaveOrUnsave(archived = false) {
    try {
      setIsUpdating(true);
      if (isSaved) {
        await unsavePoem(poemId);
      } else {
        await savePoem(poemId, archived);
      }
      setShowDropdown(false);
      setRefreshKey((k) => k + 1);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("İşlem başarısız:", error);
    } finally {
      setIsUpdating(false);
    }
  }


  async function handleReadToggle() {
    if (!isSaved) return;

    try {
      setIsUpdating(true);
      if (isRead) {
        await markPoemAsUnread(poemId);
      } else {
        await markPoemAsRead(poemId);
      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Okundu/Okunmadı durumu güncellenemedi:", error);
    } finally {
      setIsUpdating(false);
      setShowDropdown(false);
      setRefreshKey((k) => k + 1);
    }
  }



  const handleCollectionSaveCompleted = async (selectedPoemId: number | string, collectionId: number) => {
    setIsUpdating(true);
    try {

      if (!isSaved) {
        await savePoem(selectedPoemId, false);
      }



      setShowCollectionModal(false);
      setRefreshKey((k) => k + 1);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("Koleksiyona kaydetme başarısız:", error);
    } finally {
      setIsUpdating(false);
    }
  };



  if (variant === "icon") {
    return (      <div className="relative">
        <button
          onClick={handleButtonClick}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all"
          disabled={isUpdating}
          title={isSaved ? "Kaydedildi" : "Kaydet"}
        >          {isUpdating ? (
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiBookmark
              className={`w-4 h-4 ${isSaved ? "text-blue-500" : ""}`}
            />
          )}
        </button>

        {showReadStatus && isSaved && !isRead && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}

        {/* Koleksiyon Seçici */}
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          onSave={handleCollectionSaveCompleted}
          poemId={typeof poemId === 'string' ? parseInt(poemId) : poemId}
        />
      </div>
    );
  }
  if (variant === "inline") {
    return (
      <div className="relative">
        <button
          onClick={handleButtonClick}
          className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all ${
            isSaved
              ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiBookmark
              className={`w-4 h-4 mr-2 ${isSaved ? "text-blue-600" : "text-gray-500"}`}
            />
          )}
          {isSaved ? "Kaydedildi" : "Kaydet"}
        </button>

        {/* Koleksiyon Seçici */}
        <CollectionModal
          isOpen={showCollectionModal}
          onClose={() => setShowCollectionModal(false)}
          onSave={handleCollectionSaveCompleted}
          poemId={typeof poemId === 'string' ? parseInt(poemId) : poemId}
        />
      </div>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={handleButtonClick}
        className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all ${
          isSaved
            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
        }`}
        disabled={isUpdating}
      >
        {isUpdating ? (
            <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiBookmark
              className={`w-4 h-4 mr-2 ${isSaved ? "text-blue-600" : "text-gray-500"}`}
            />
          )}
        {isSaved ? "Kaydedildi" : "Kaydet"}
      </button>

      {/* Koleksiyon Seçici */}
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        onSave={handleCollectionSaveCompleted}
        poemId={typeof poemId === 'string' ? parseInt(poemId) : poemId}
      />
    </div>
  );
}