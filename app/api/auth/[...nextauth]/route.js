import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName,
          image: user.avatar,
          role: user.role,
          username: user.username,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          const username = user.email.split("@")[0] + Math.random().toString(36).slice(-4);
          dbUser = await User.create({
            email: user.email,
            displayName: user.name,
            username,
            avatar: user.image || "",
            provider: "google",
            providerId: account.providerAccountId,
          });
        }
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.username = dbUser.username;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
