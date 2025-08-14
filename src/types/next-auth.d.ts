// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            permissions: string[];
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
    }

    interface JWT {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
    }
}
