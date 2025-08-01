<div align="center">

<img src="public/poemica-logo.png" alt="Poemica" width="96" />

# Poemica

**Şiir yazanlar ve okuyanlar için sosyal platform.**
Şiirini paylaş, başkalarınınkini keşfet, beğen, öner, koleksiyonlara ekle ve sevdiğin şairleri takip et.

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,postgres,firebase,nodejs,vercel" alt="Tech stack" />
</p>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![NextAuth](https://img.shields.io/badge/NextAuth.js-7C3AED?style=flat-square&logo=auth0&logoColor=white)
![Firebase Storage](https://img.shields.io/badge/Firebase_Storage-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 🎬 Demo

<div align="center">

![Poemica demo](docs/demo.gif)

▶️ [Videoyu yüksek kalitede izle (MP4)](docs/demo.mp4)

</div>

## 📸 Ekran Görüntüleri

<table>
  <tr>
    <td width="50%"><b>Ana Sayfa</b><br/><img src="docs/screenshots/home.png" alt="Ana sayfa" /></td>
    <td width="50%"><b>Keşfet</b><br/><img src="docs/screenshots/explore.png" alt="Keşfet" /></td>
  </tr>
  <tr>
    <td><b>Şiir Detayı</b><br/><img src="docs/screenshots/poem.png" alt="Şiir detayı" /></td>
    <td><b>Akış</b><br/><img src="docs/screenshots/feed.png" alt="Akış" /></td>
  </tr>
  <tr>
    <td><b>Profil</b><br/><img src="docs/screenshots/profile.png" alt="Profil" /></td>
    <td><b>Şiir Yaz</b><br/><img src="docs/screenshots/create.png" alt="Şiir oluştur" /></td>
  </tr>
  <tr>
    <td><b>Panel</b><br/><img src="docs/screenshots/dashboard.png" alt="Panel" /></td>
    <td><b>Giriş</b><br/><img src="docs/screenshots/login.png" alt="Giriş" /></td>
  </tr>
</table>

## ✨ Özellikler

| | |
|---|---|
| 🔐 **Kimlik doğrulama** | E-posta + şifre ile kayıt/giriş (NextAuth Credentials, bcrypt ile hash'lenmiş şifreler, JWT oturum), korumalı sayfalar için middleware |
| ✍️ **Şiir yazma** | Başlık, içerik, etiketler ve kapak görseli ile şiir oluşturma, düzenleme ve silme |
| 🎨 **AI kapak görseli** | Şiirin içeriğinden Google Gemini (gemini-2.0-flash) ile görsel promptu üretip buna göre kapak görseli önerme |
| ❤️ **Etkileşim** | Beğeni, öneri, yorum, okunma ve görüntülenme sayıları |
| 🔖 **Kaydet & Koleksiyonlar** | Şiirleri kaydetme, okundu/arşiv işaretleme, notlu, herkese açık veya gizli koleksiyonlar |
| 👥 **Sosyal** | Kullanıcı takip etme, takipçi/takip edilen listeleri, profil istatistikleri |
| 🧭 **Keşif** | Kişisel akış, trend şiirler, en çok önerilenler, takip ettiklerinin önerileri, rastgele şiir |
| ☁️ **Görsel yükleme** | Profil ve kapak görselleri sunucu tarafında Firebase Storage'a yüklenir |
| 📱 **Responsive** | Mobil menü ve mobil uyumlu arayüz, Framer Motion animasyonları |

## 🛠️ Teknolojiler

| Katman | Kullanılan |
|---|---|
| **Frontend** | Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Radix UI, React Icons, React Hot Toast |
| **Backend** | Next.js Route Handlers (REST API), NextAuth.js, bcrypt |
| **Veritabanı** | PostgreSQL, Drizzle ORM, drizzle-kit |
| **Depolama** | Firebase Storage (firebase-admin ile sunucu tarafında) |
| **Yapay zeka** | Google Gemini API |
| **Deploy** | Vercel |

## 🏗️ Mimari

```mermaid
flowchart LR
    U[Tarayıcı] -->|React 19 / App Router| N[Next.js 15]
    N -->|Route Handlers /api/*| A[API katmanı]
    A -->|NextAuth + JWT| AUTH[(Oturum)]
    A -->|Drizzle ORM| DB[(PostgreSQL)]
    A -->|firebase-admin| FS[(Firebase Storage)]
    A -->|REST| G[Google Gemini]
```

### Veritabanı şeması

`users` · `poems` · `follows` · `likes` · `comments` · `recommendations` · `saved_poems` · `collections` · `collection_items` · `user_sessions`

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # kayıt, giriş, çıkış, NextAuth
│   │   ├── poems/           # CRUD, beğeni, öneri, yorum, kaydet, akış, trend, rastgele
│   │   ├── users/           # profil, takip, takipçiler, istatistikler
│   │   ├── collections/     # koleksiyon CRUD ve şiir ekleme/çıkarma
│   │   ├── upload/          # Firebase Storage yükleme
│   │   └── generate-image-prompt/  # Gemini ile kapak promptu
│   ├── feed/ explore/ random/ poems/ profile/ dashboard/ collections/ saved-poems/
│   ├── create-poem/ login/ register/
│   └── layout.tsx, page.tsx, not-found.tsx
├── components/              # auth, layout, poems, dashboard, profile
├── db/                      # Drizzle şeması ve bağlantı
├── lib/                     # auth, firebase, hook'lar, yardımcılar
└── middleware.ts            # korumalı rotalar
```

## 🚀 Kurulum

**Gereksinimler:** Node.js 18+, PostgreSQL

```bash
git clone https://github.com/LordAurora/poemica.git
cd poemica
npm install
```

Proje kök dizininde `.env.local` oluştur:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/poemica
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=   # openssl rand -base64 32

# Görsel yükleme (opsiyonel)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI kapak promptu (opsiyonel)
GEMINI_API_KEY=
```

Şemayı veritabanına uygula ve geliştirme sunucusunu başlat:

```bash
npx drizzle-kit push
npm run dev
```

Demo verisi için (yalnızca development'ta): [http://localhost:3000/api/seed](http://localhost:3000/api/seed)
Demo hesap: `ahmet@example.com` / `password123`

## 📜 Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Drizzle şemasını veritabanına uygular |
| `npm run db:studio` | Drizzle Studio |
