"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as Form from "@radix-ui/react-form";
import * as Label from "@radix-ui/react-label";
import { FiSave, FiX, FiCheck, FiTag, FiAlertCircle, FiInfo, FiImage, FiUpload } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';


const POEM_TAGS = [
  "Lirik", "Epik", "Serbest", "Romantik", "Doğa", 
  "Sevgi", "Hüzün", "Umut", "Felsefi", "Mizah"
];

export default function PoemForm({ onSubmit }: { onSubmit: (poem: any) => Promise<any> }) {
  const router = useRouter();  const [poem, setPoem] = useState({ 
    title: '', 
    content: '', 
    tags: [] as string[],
    coverImage: null as File | null,
    coverImageUrl: null as string | null,
    alternativeImageUrl: null as string | null
  });
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [autoSaveActive, setAutoSaveActive] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showAIImagesModal, setShowAIImagesModal] = useState(false);
  

  useEffect(() => {

  }, [showAIImagesModal]);
  

  useEffect(() => {

  }, [showAIImagesModal]);


  useEffect(() => {
    const savedDraft = localStorage.getItem('poemDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setPoem(parsedDraft);
        setCharCount(parsedDraft.content.length);
      } catch (e) {
        console.error('Failed to parse saved draft');
      }
    }
  }, []);


  useEffect(() => {
    if (!autoSaveActive || (!poem.title && !poem.content && poem.tags.length === 0)) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      localStorage.setItem('poemDraft', JSON.stringify(poem));
      setSaveStatus('saved');
      

      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
    }, 3000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [poem, autoSaveActive]);


  useEffect(() => {
    setCharCount(poem.content.length);
  }, [poem.content]);


  const poemThemes = [
    "Aşk", "Doğa", "Özlem", "Hayat", "Umut", "Yalnızlık", 
    "Özgürlük", "Dostluk", "Zaman", "Hüzün", "Vatan", "Barış"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setPoem(prev => ({ ...prev, title: suggestion }));
    setShowSuggestions(false);
  };  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
        toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır');
        return;
      }
        try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'poem-cover');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Upload failed:', errorData);
          throw new Error(errorData.error || 'Resim yüklenirken bir hata oluştu');        }
        
        const data = await response.json();
        

        setPoem(prev => ({ 
          ...prev, 
          coverImage: file,
          coverImageUrl: data.url,
          alternativeImageUrl: data.alternativeUrl
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        toast.success('Resim başarıyla yüklendi!', { 
          id: 'image-upload',
          duration: 2000
        });
      } catch (error) {
        console.error('Upload error:', error);
        setError(error instanceof Error ? error.message : 'Resim yüklenirken bir hata oluştu');
        toast.error(error instanceof Error ? error.message : 'Resim yüklenirken bir hata oluştu', { id: 'image-upload' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poem.title.trim()) {
      setError('Lütfen bir başlık giriniz');
      return;
    }
    
    if (!poem.content.trim()) {
      setError('Lütfen şiir içeriğini giriniz');
      return;
    }    try {
      setIsSaving(true);
      

      const coverImageUrl = poem.coverImageUrl;


      const data: any = await onSubmit({
        ...poem,
        coverImage: coverImageUrl
      });
      

      localStorage.removeItem('poemDraft');

      setPoem({ title: '', content: '', tags: [], coverImage: null, coverImageUrl: null, alternativeImageUrl: null });
      setPreviewUrl(null);
      setCharCount(0);
      setError('');
      setSaveStatus('success');
      

      router.push(`/poems/${data?.poem?.id}`);
    } catch (err) {
      console.error('Error submitting poem:', err);
      setError(err instanceof Error ? err.message : 'Şiir kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleClearDraft = () => {
    if (window.confirm('Taslak şiirinizi silmek istediğinize emin misiniz?')) {
      localStorage.removeItem('poemDraft');
      setPoem({ title: '', content: '', tags: [], coverImage: null, coverImageUrl: null, alternativeImageUrl: null });
      setCharCount(0);
      setSaveStatus('cleared');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'content') {
      setCharCount(value.length);
    }
    
    setPoem(prev => ({ ...prev, [name]: value }));
    setError('');
    setSaveStatus('typing');
  };

  const toggleAutoSave = () => {
    setAutoSaveActive(!autoSaveActive);
  };

  const toggleTag = (tag: string) => {
    setPoem(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      
      return { ...prev, tags: newTags };
    });
    setSaveStatus('typing');
  };


  const getCharCountColor = () => {
    if (charCount === 0) return 'text-gray-400';
    if (charCount < 1000) return 'text-green-500';
    if (charCount < 1700) return 'text-yellow-500';
    if (charCount < 2000) return 'text-orange-500';
    return 'text-red-500';
  };


  const getSaveStatus = () => {
    switch (saveStatus) {
      case 'typing':
        return { icon: <FiInfo className="mr-1.5" />, text: 'Düzenleniyor...', color: 'text-blue-500' };
      case 'saved':
        return { icon: <FiCheck className="mr-1.5" />, text: 'Otomatik kaydedildi', color: 'text-green-500' };
      case 'cleared':
        return { icon: <FiX className="mr-1.5" />, text: 'Taslak silindi', color: 'text-orange-500' };
      case 'success':
        return { icon: <FiCheck className="mr-1.5" />, text: 'Şiir başarıyla kaydedildi!', color: 'text-green-500' };
      default:
        return { icon: null, text: '', color: '' };
    }
  };
  const statusInfo = getSaveStatus();


  const generateCoverImage = async () => {
    if (!poem.title || !poem.content) {
      setError('Kapak resmi oluşturmak için şiir başlığı ve içeriği gerekli!');
      toast.error('Kapak resmi oluşturmak için şiir başlığı ve içeriği gerekli!');
      return;
    }

    try {
      setIsGeneratingImage(true);
      setShowAIImagesModal(true);
      

      const response = await fetch('/api/generate-image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          poemContent: poem.content
        })
      });


      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Görsel oluşturma başarısız oldu: ${response.status}`);
      }

      const data = await response.json();

        if (data.success) {

        setGeneratedPrompt(data.prompt);
        setGeneratedImages(data.images);
        

        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        

        toast.success('Görsel oluşturuldu!');
      } else {
        throw new Error(data.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('AI görsel oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Görsel oluşturulurken bir hata oluştu');
      toast.error(error instanceof Error ? error.message : 'Görsel oluşturulurken bir hata oluştu');    } finally {
      setIsGeneratingImage(false);
    }
  };


  const generateNewImages = async () => {
    await generateCoverImage();
  };

  const selectCoverImage = async () => {
    if (!selectedImage) {
      toast.error('Lütfen bir görsel seçin');
      return;
    }
    
    try {
      toast.loading('Görsel kaydediliyor...', { id: 'ai-image-save' });
      

      const imageUrl = selectedImage.startsWith('/') 
        ? `${window.location.origin}${selectedImage}` 
        : selectedImage;
        
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      

      const imageFile = new File(
        [imageBlob], 
        `ai-cover-${Date.now()}.jpg`, 
        { type: imageBlob.type }
      );
      

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('type', 'poem-cover');
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Resim yüklenirken bir hata oluştu');
      }
      
      const uploadData = await uploadResponse.json();
      

      setPoem(prev => ({ 
        ...prev, 
        coverImage: imageFile,
        coverImageUrl: uploadData.url 
      }));
      

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
      

      setShowAIImagesModal(false);
      
      toast.success('Kapak resmi başarıyla eklendi!', { id: 'ai-image-save' });
    } catch (error) {
      console.error('Kapak resmi seçme hatası:', error);
      toast.error('Kapak resmi eklenirken bir hata oluştu', { id: 'ai-image-save' });
    }
  };
  

  const openAIImageCreation = async () => {
    if (!poem.title || !poem.content) {
      toast.error('Şiir başlığı ve içeriği olmadan görsel oluşturulamaz.');
      return;
    }
    
    try {

      await generateCoverImage();
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      toast.error('Görsel oluşturulurken bir hata oluştu');
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Yeni Şiir Oluştur
        </h1>
        <p className="text-gray-500 mt-3">
          Duygularını özgürce ifade et ve şiirini dünyayla paylaş
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-pulse">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {saveStatus && (
        <div className={`${statusInfo.color} text-sm flex items-center mb-4 animate-fade-in-out transition-all duration-300`}>
          {statusInfo.icon} {statusInfo.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="title" className="block text-lg font-medium text-gray-700">
              Başlık
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleAutoSave}
                className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                  autoSaveActive 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                {autoSaveActive ? (
                  <span className="flex items-center"><FiCheck className="mr-1.5" /> Otomatik kayıt açık</span>
                ) : (
                  'Otomatik kayıt kapalı'
                )}
              </button>
              {(poem.title || poem.content) && (
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center hover:bg-red-100 transition-colors duration-200"
                >
                  <FiX className="mr-1.5" /> Taslağı Temizle
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              value={poem.title}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Şiirinizin başlığını giriniz"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm text-black placeholder:text-black/50"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200">
                <div className="p-3 text-sm font-medium text-black border-b border-gray-100">Tema önerileri:</div>
                <div className="flex flex-wrap gap-1.5 p-3">
                  {poemThemes.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => handleSuggestionClick(theme)}
                      className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-full border border-gray-200 transition-colors duration-200 text-black"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="content" className="block text-lg font-medium text-gray-700">
              İçerik
            </label>
            <span className={`text-sm ${getCharCountColor()} font-medium transition-colors duration-300 flex items-center`}>
              {charCount > 1700 && <FiAlertCircle className="mr-1.5" />}
              {charCount}/2000 karakter
            </span>
          </div>
          <textarea
            id="content"
            name="content"
            value={poem.content}
            onChange={handleChange}
            rows={12}
            placeholder="Şiirinizi buraya yazınız..."
            className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none text-black placeholder:text-black/50 ${
              charCount > 2000 ? 'border-red-300 focus:ring-red-400' : ''
            }`}
          />
        </div>        <div className="space-y-3">
          <Label.Root className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <FiTag className="text-indigo-500" />
            Etiketler
          </Label.Root>
          <div className="flex flex-wrap gap-2">
            {POEM_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  poem.tags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 border shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 border hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Şiirinizi tanımlayan etiketleri seçerek daha kolay keşfedilmesini sağlayabilirsiniz.
          </p>
        </div>        <div className="space-y-2">
          <Label.Root className="text-lg font-medium text-gray-700 flex items-center gap-2">
            <FiImage className="text-indigo-500" />
            Kapak Resmi
          </Label.Root><div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={previewUrl}
                    alt="Kapak resmi önizleme"
                    fill
                    className="object-cover rounded-lg"
                  />                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setPoem(prev => ({ ...prev, coverImage: null, coverImageUrl: null }));
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
                <label
                  htmlFor="cover-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Resim Yükle</span>
                  <input
                    id="cover-image"
                    name="cover-image"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <span className="px-1">veya</span>                <button
                  type="button"                  onClick={async () => {

                    try {
                      if (!poem.title || !poem.content) {
                        setError('Kapak resmi oluşturmak için şiir başlığı ve içeriği gerekli!');
                        toast.error('Kapak resmi oluşturmak için şiir başlığı ve içeriği gerekli!');
                        return;
                      }

                      await generateCoverImage();
                    } catch (err) {
                      console.error('Error in AI button click handler:', err);
                      toast.error('Görsel oluşturulurken bir hata oluştu');
                    }
                  }}
                  disabled={isGeneratingImage || !poem.title || !poem.content}
                  className={`relative cursor-pointer rounded-md font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 hover:from-purple-600 hover:to-pink-600 transition-all ${(isGeneratingImage || !poem.title || !poem.content) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGeneratingImage ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Oluşturuluyor...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      AI ile Kapak Oluştur
                    </span>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, GIF max 10MB
              </p>
            </div>
          </div>          {/* AI Image Modal */}
          {showAIImagesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Şiiriniz için Kapak Resmi</h3>
                  <button 
                    onClick={() => setShowAIImagesModal(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-all"
                    aria-label="Kapat"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                
                {isGeneratingImage ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="animate-spin mb-4">
                      <svg className="h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>                    <p className="text-gray-700">Şiiriniz için görsel oluşturuluyor...</p>
                    <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
                  </div>                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Şiirinizin içeriğine göre oluşturulan kapak resmi:
                    </p>
                    
                    {/* Oluşturulan prompt'u göster */}
                    {generatedPrompt && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 overflow-auto max-h-32">
                        <p className="font-semibold mb-1">Oluşturulan Görsel Promptu:</p>
                        <p className="italic">{generatedPrompt}</p>
                      </div>
                    )}
                    
                    {/* Tek görsel göster */}
                    <div className="flex justify-center mb-6">
                      {generatedImages && generatedImages.length > 0 && (
                        <div 
                          className="relative rounded-lg overflow-hidden border-2 border-indigo-500 w-full max-w-md"
                        >
                          <div className="relative w-full h-96">
                            <Image 
                              src={generatedImages[0]} 
                              alt="Şiir kapak görseli" 
                              fill 
                              sizes="(max-width: 768px) 100vw, 400px" 
                              style={{ objectFit: 'cover' }} 
                              priority 
                              onError={(e: any) => { 
                                console.error(`Image load error for ${generatedImages[0]}`, e); 
                              }} 
                              unoptimized={generatedImages[0].startsWith('/uploads/')} 
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setShowAIImagesModal(false)}
                        className="flex items-center px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <FiX className="mr-1 h-4 w-4" />
                        Kapat
                      </button>
                        <div className="flex items-center gap-2">
                        <button
                          onClick={generateNewImages}
                          className="flex items-center text-sm px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Yeni Görsel Oluştur
                        </button>
                        
                        <button
                          onClick={selectCoverImage}
                          disabled={!generatedImages || generatedImages.length === 0}
                          className={`flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-colors ${(!generatedImages || generatedImages.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Kapak Olarak Kullan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving || charCount > 2000}
            className={`flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200
            ${(isSaving || charCount > 2000) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Yayınlanıyor...' : 'Şiiri Yayınla'}
          </button>
        </div>
      </form>
      
      <div className="mt-10 border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Şiir Yazma İpuçları
        </h3>
        <ul className="text-xs text-gray-500 space-y-2.5 bg-gray-50 p-4 rounded-xl">
          <li className="flex items-start">
            <div className="rounded-full p-1 bg-indigo-100 text-indigo-600 mr-2.5 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            Duygularınızı özgürce ifade edin, başkalarının ne düşüneceğini umursamayın.
          </li>
          <li className="flex items-start">
            <div className="rounded-full p-1 bg-indigo-100 text-indigo-600 mr-2.5 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            Canlı ve somut imgeler kullanın, soyut kavramları somutlaştırın.
          </li>
          <li className="flex items-start">
            <div className="rounded-full p-1 bg-indigo-100 text-indigo-600 mr-2.5 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            Ses tekrarları (aliterasyon, asonans) kullanarak şiirinize müzikal bir boyut katın.
          </li>
          <li className="flex items-start">
            <div className="rounded-full p-1 bg-indigo-100 text-indigo-600 mr-2.5 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            Şiirinizi yazarken, dizenizi kırmaktan çekinmeyin; yeni satırlar şiirinize ritim katar.
          </li>
        </ul>
      </div>
    </div>
  );
}