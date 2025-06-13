import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "İsim, e-posta ve şifre gereklidir" },
        { status: 400 }
      );
    }
    
    const result = await createUser(name, email, password);
    
    if (!result.success) {
      console.error("Kullanıcı kaydı başarısız oldu:", result.error);
      

      if (result.error && result.error.toString().includes("unique constraint")) {
        return NextResponse.json(
          { success: false, message: "Bu e-posta adresi zaten kullanımda" },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, message: "Kullanıcı kaydı başarısız oldu" },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz.",
      user: {
        id: result.user!.id,
        name: result.user!.name,
        email: result.user!.email
      }
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası, lütfen daha sonra tekrar deneyin" },
      { status: 500 }
    );
  }
}