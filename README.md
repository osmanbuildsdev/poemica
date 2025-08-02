<div align="center">

🇬🇧 **English** | [🇹🇷 Türkçe](README.tr.md)

<img src="public/poemica-logo.png" alt="Poemica" width="96" />

# Poemica

**A social platform for people who write and read poetry.**
Share your poems, discover others, like and recommend them, organize them into collections and follow your favorite poets.

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

▶️ [Watch the full-quality video (MP4)](docs/demo.mp4)

</div>

> The app's interface is in Turkish.

## 📸 Screenshots

<table>
  <tr>
    <td width="50%"><b>Home</b><br/><img src="docs/screenshots/home.png" alt="Home" /></td>
    <td width="50%"><b>Explore</b><br/><img src="docs/screenshots/explore.png" alt="Explore" /></td>
  </tr>
  <tr>
    <td><b>Poem Detail</b><br/><img src="docs/screenshots/poem.png" alt="Poem detail" /></td>
    <td><b>Feed</b><br/><img src="docs/screenshots/feed.png" alt="Feed" /></td>
  </tr>
  <tr>
    <td><b>Profile</b><br/><img src="docs/screenshots/profile.png" alt="Profile" /></td>
    <td><b>Write a Poem</b><br/><img src="docs/screenshots/create.png" alt="Create poem" /></td>
  </tr>
  <tr>
    <td><b>Dashboard</b><br/><img src="docs/screenshots/dashboard.png" alt="Dashboard" /></td>
    <td><b>Sign In</b><br/><img src="docs/screenshots/login.png" alt="Sign in" /></td>
  </tr>
</table>

## ✨ Features

| | |
|---|---|
| 🔐 **Authentication** | Email + password sign-up and sign-in (NextAuth Credentials, bcrypt-hashed passwords, JWT sessions), middleware for protected routes |
| ✍️ **Writing poems** | Create, edit and delete poems with a title, body, tags and cover image |
| 🎨 **AI cover images** | Generates an image prompt from the poem with Google Gemini (gemini-2.0-flash) and suggests a matching cover image |
| ❤️ **Interactions** | Likes, recommendations, comments, read and view counts |
| 🔖 **Saved poems & collections** | Save poems, mark them as read or archived, public or private collections with notes |
| 👥 **Social** | Follow users, follower/following lists, profile stats |
| 🧭 **Discovery** | Personal feed, trending poems, most recommended, recommendations from people you follow, random poem |
| ☁️ **Image uploads** | Profile and cover images are uploaded to Firebase Storage on the server |
| 📱 **Responsive** | Mobile menu and mobile-friendly layout, Framer Motion animations |

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Framer Motion, Radix UI, React Icons, React Hot Toast |
| **Backend** | Next.js Route Handlers (REST API), NextAuth.js, bcrypt |
| **Database** | PostgreSQL, Drizzle ORM, drizzle-kit |
| **Storage** | Firebase Storage (server-side via firebase-admin) |
| **AI** | Google Gemini API |
| **Deployment** | Vercel |

## 🏗️ Architecture

```mermaid
flowchart LR
    U[Browser] -->|React 19 / App Router| N[Next.js 15]
    N -->|Route Handlers /api/*| A[API layer]
    A -->|NextAuth + JWT| AUTH[(Session)]
    A -->|Drizzle ORM| DB[(PostgreSQL)]
    A -->|firebase-admin| FS[(Firebase Storage)]
    A -->|REST| G[Google Gemini]
```

### Database schema

`users` · `poems` · `follows` · `likes` · `comments` · `recommendations` · `saved_poems` · `collections` · `collection_items` · `user_sessions`

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # register, login, logout, NextAuth
│   │   ├── poems/           # CRUD, like, recommend, comment, save, feed, trending, random
│   │   ├── users/           # profile, follow, followers, stats
│   │   ├── collections/     # collection CRUD, add/remove poems
│   │   ├── upload/          # Firebase Storage upload
│   │   └── generate-image-prompt/  # cover prompt with Gemini
│   ├── feed/ explore/ random/ poems/ profile/ dashboard/ collections/ saved-poems/
│   ├── create-poem/ login/ register/
│   └── layout.tsx, page.tsx, not-found.tsx
├── components/              # auth, layout, poems, dashboard, profile
├── db/                      # Drizzle schema and connection
├── lib/                     # auth, firebase, hooks, helpers
└── middleware.ts            # protected routes
```

## 🚀 Getting Started

**Requirements:** Node.js 18+, PostgreSQL

```bash
git clone https://github.com/osmanbuildsdev/poemica.git
cd poemica
npm install
```

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/poemica
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=   # openssl rand -base64 32

# Image uploads (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# AI cover prompt (optional)
GEMINI_API_KEY=
```

Push the schema to the database and start the dev server:

```bash
npx drizzle-kit push
npm run dev
```

Demo data (development only): [http://localhost:3000/api/seed](http://localhost:3000/api/seed)
Demo account: `ahmet@example.com` / `password123`

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Pushes the Drizzle schema to the database |
| `npm run db:studio` | Drizzle Studio |
