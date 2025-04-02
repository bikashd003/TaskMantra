import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/Utility/db";
import { User } from "@/models/User";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                name: { label: "Name", type: "text", placeholder: "Name" },
                email: { label: "Email", type: "email", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials) {
                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials?.email });
                    if (!user) throw new Error("User not found");
                    if (credentials?.password) {
                        const valid = await bcrypt.compare(credentials.password, user.password);
                        if (!valid) throw new Error("Invalid credentials");
                    }
                    const userData = {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        systemRole: user.systemRole,
                        image: user.image || null,
                    };
                    return userData;
                } catch (error: any) {
                    throw new Error(error.message || "An error occurred");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await connectDB();
                let dbUser = await User.findOne({ email: user.email });
                if (!dbUser) {
                    dbUser = await User.create({
                        name: user.name,
                        email: user.email,
                        systemRole: "User",
                        image: profile?.picture,
                    });
                } else if (!dbUser.image && profile?.picture) {
                    await User.updateOne({ _id: dbUser._id }, { image: profile?.picture });
                    dbUser.image = profile?.picture;
                }
                user.id = dbUser._id.toString();
                user.systemRole = dbUser.systemRole;
                user.image = dbUser.image || profile?.picture;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
              token.id = user.id;
              token.name = user.name;
              token.email = user.email;
              token.systemRole = user.systemRole;
              token.image = user.image;
          }
            return token;
        },
        async session({ session, token }) {
            if (token) {
              session.user = {
                  id: token.id as string,
                  name: token.name as string,
                  email: token.email as string,
                  systemRole: token.systemRole as string,
                  image: token.image as string | undefined,
              };
          }
            return session;
        },
    },
};