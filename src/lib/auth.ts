import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/env";
import { loginRequest } from "@/lib/login";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                const { email, password } = credentials ?? {};
                if (!email || !password) return null;

                return loginRequest(email, password);
            },
        }),
    ],
    debug: true,
    logger: {
        error(code, ...message) {
            console.error(code, ...message);
        },
        warn(code, ...message) {
            console.warn(code, ...message);
        },
        debug(code, ...message) {
            console.log(code, ...message);
        },
    },
    session: { strategy: "jwt" },
    // Avoid exposing the internal `/api/auth/error` route in the browser by
    // redirecting authentication errors back to the custom login page.
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = (user as any).role;
                token.permissions = (user as any).permissions;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.permissions = token.permissions as string[];
            }
            return session;
        },
    },
    secret: env.NEXTAUTH_SECRET,
};
