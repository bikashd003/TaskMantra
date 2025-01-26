import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/Utility/db";
import { User } from "@/models/User";


export const authOptions = {
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                name: {
                    label: "Name",
                    type: "text",
                    placeholder: "Name",
                },
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Email",
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "Password",
                },
            },
            async authorize(credentials) {
                try {
                    await connectDB();
                    const user = await User.findOne({ email: credentials?.email });
                    if (!user) {
                        throw new Error("User not found");
                    }
                    const valid = await bcrypt.compare(credentials?.password, user.password);
                    if (!valid) {
                        throw new Error("Invalid credentials");
                    }
                    return user;
                } catch (error: any) {
                    throw new Error(error.message || "An error occurred");
                }
            }
            ,
        }),
    ],
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userId = user._id;
                token.email = user.email;
                return Promise.resolve(token);
            }
            return Promise.resolve(token);
        },
        async session({ session, token }) {
            if (token) {

                session.user.id = token.userId as string;
                session.user.email = token.email as string;
            }
            return Promise.resolve(session);
        }
    },
};