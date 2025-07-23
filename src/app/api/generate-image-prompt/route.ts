import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';


type GeminiPromptResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Generate image API called');
    const { poemContent } = await request.json();
    
    console.log('Received poem content (abbreviated):', poemContent?.substring(0, 50) + '...');
    
    if (!poemContent) {
      console.log('Error: Missing poem content');
      return NextResponse.json(
        { error: 'Şiir içeriği bulunamadı' },
        { status: 400 }
      );
    }


    const generatedPrompt = await generatePromptFromPoem(poemContent);
    console.log('Generated prompt:', generatedPrompt);
    
    if (!generatedPrompt) {
      return NextResponse.json(
        { error: 'Görsel promptu oluşturulamadı' },
        { status: 500 }
      );
    }

    const imageCount = 1;
    const imageUrls = await simulateImageGeneration(generatedPrompt, imageCount);
    console.log('Generated image URL:', imageUrls[0]);
    

    return NextResponse.json({ 
      prompt: generatedPrompt,
      images: imageUrls,
      success: true 
    });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Görseller oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}


async function generateImages(prompt: string, count: number): Promise<string[]> {
  try {


    const imageUrls: string[] = [];
    

    for (let i = 0; i < count; i++) {


      const promptHash = Array.from(prompt).reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
      }, 0);
      

      const seed = Math.abs(promptHash % 1000) + i * 10 + 1;
      

      const width = 800;
      const height = 1000;
      const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      

      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `ai-generated-${uniqueSuffix}.jpg`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const path = join(uploadDir, filename);
      await writeFile(path, buffer);
      

      imageUrls.push(`/uploads/${filename}`);
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Failed to generate images:', error);
    throw new Error('Failed to generate images');
  }
}


async function generatePromptFromPoem(content: string): Promise<string> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      throw new Error('API anahtarı yapılandırması eksik');
    }


    const truncatedContent = content.length > 1000 ? content.substring(0, 1000) + "..." : content;

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const response = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{            text: `Bu şiiri analiz edip, şiirin temasını, duygusunu ve atmosferini yansıtan görsel bir prompt oluştur. 
            Bu prompt, yapay zeka görsel üretim modeline verilecek ve şiirin kapak resmi olarak kullanılacak bir görsel üretilecek.
            Prompt İngilizce olmalı ve sanatsal, derin ve etkileyici bir görsel oluşturacak şekilde hazırlanmalı.
            Prompt sanatsal terimler içermeli, renk şemaları önermeli ve şiirin esasını yansıtmalı.
            Yanıtında sadece görsel promptu ver, başka açıklama yapma.
            
            İŞTE ŞİİR:
            ${truncatedContent}`
          }]
        }],        generationConfig: {
          temperature: 0.6,
          topK: 32,
          topP: 0.9,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Görsel prompt oluşturulurken bir hata oluştu');
    }

    const data = await response.json() as GeminiPromptResponse;
    
    if (!data.candidates || data.candidates.length === 0 || 
        !data.candidates[0].content || 
        !data.candidates[0].content.parts || 
        data.candidates[0].content.parts.length === 0) {
      throw new Error('Gemini API beklenmeyen bir yanıt döndürdü');
    }
    
    const generatedPrompt = data.candidates[0].content.parts[0].text.trim();
    console.log('Generated prompt from Gemini:', generatedPrompt);
    
    return generatedPrompt;
  } catch (error) {
    console.error('Error generating prompt from poem:', error);

    return "A poetic and artistic image with dreamy colors and abstract elements, suitable for a poetry book cover";
  }
}


async function simulateImageGeneration(prompt: string, count: number): Promise<string[]> {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      throw new Error('API anahtarı yapılandırması eksik');
    }



    return generateImages(prompt, count);
  } catch (error) {
    console.error('Error generating images with Gemini:', error);
    throw new Error('Görseller oluşturulurken bir hata meydana geldi');
  }
}
