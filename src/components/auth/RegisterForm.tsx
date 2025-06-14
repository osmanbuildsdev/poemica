"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as Form from "@radix-ui/react-form";
import * as Label from "@radix-ui/react-label";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kayıt yapılamadı");
      }


      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Poemica'ya Kaydolun
        </h1>
        <p className="text-gray-500 mt-3">
          Şiir dünyasına adım atın ve yaratıcılığınızı keşfedin
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      <Form.Root className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label.Root className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              İsim
            </Label.Root>
            <Form.Field name="name">
              <Form.Control asChild>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Adınız Soyadınız"
                />
              </Form.Control>
              <Form.Message className="text-red-500 text-sm mt-1" match="valueMissing">
                İsim gereklidir
              </Form.Message>
            </Form.Field>
          </div>

          <div>
            <Label.Root className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-posta
            </Label.Root>
            <Form.Field name="email">
              <Form.Control asChild>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="ornek@email.com"
                />
              </Form.Control>
              <Form.Message className="text-red-500 text-sm mt-1" match="valueMissing">
                E-posta gereklidir
              </Form.Message>
              <Form.Message className="text-red-500 text-sm mt-1" match="typeMismatch">
                Lütfen geçerli bir e-posta adresi girin
              </Form.Message>
            </Form.Field>
          </div>

          <div>
            <Label.Root className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Şifre
            </Label.Root>
            <Form.Field name="password">
              <Form.Control asChild>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  placeholder="••••••••"
                />
              </Form.Control>
              <Form.Message className="text-red-500 text-sm mt-1" match="valueMissing">
                Şifre gereklidir
              </Form.Message>
              <Form.Message className="text-red-500 text-sm mt-1" match="tooShort">
                Şifre en az 6 karakter olmalıdır
              </Form.Message>
            </Form.Field>
          </div>

          <div>
            <Label.Root className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
              Şifreyi Onayla
            </Label.Root>
            <Form.Field name="confirmPassword">
              <Form.Control asChild>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                />
              </Form.Control>
              <Form.Message className="text-red-500 text-sm mt-1" match="valueMissing">
                Şifre onayı gereklidir
              </Form.Message>
            </Form.Field>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-xs text-gray-500">
            Kaydolarak, <Link href="/terms" className="text-blue-600 hover:underline">Kullanım Şartları</Link> ve{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
          </p>
        </div>

        <Form.Submit asChild>
          <button
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydolunuyor...
              </div>
            ) : (
              "Ücretsiz Kaydol"
            )}
          </button>
        </Form.Submit>
      </Form.Root>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Zaten bir hesabınız var mı?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
} 