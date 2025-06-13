import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import { generateUUID } from "@/lib/utils";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await verifyUser(credentials.email, credentials.password);
        if (result.success && result.user) {
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            image: result.user.image
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
        

        try {
          const userArr = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              image: users.image
            })
            .from(users)
            .where(eq(users.id, session.user.id));
          
          if (userArr.length > 0) {
            const dbUser = userArr[0];
            session.user.name = dbUser.name;
            session.user.email = dbUser.email;
            session.user.image = dbUser.image;
            

            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
          }
        } catch (error) {
          console.error('Error fetching fresh user data in session callback:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    }
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
};

export default authOptions;

export async function createUser(name: string, email: string, password: string) {
  try {

    const hashedPassword = await hash(password, 10);
    

    const userId = generateUUID();
    

    const newUser = await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    return { success: true, user: newUser[0] };
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error);
    return { success: false, error };
  }
}

export async function verifyUser(email: string, password: string) {
  try {

    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (foundUsers.length === 0) {
      return { success: false, error: "Kullanıcı bulunamadı" };
    }
    
    const user = foundUsers[0];
    

    const passwordMatch = await compare(password, user.password || "");
    
    if (!passwordMatch) {
      return { success: false, error: "Geçersiz şifre" };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error("Kimlik doğrulama hatası:", error);
    return { success: false, error };
  }
} 