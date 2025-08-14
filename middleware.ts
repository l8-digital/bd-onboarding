// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface ProtectedRoute {
    prefix: string;
    roles: string[];
}

const protectedRoutes: ProtectedRoute[] = [
    { prefix: "/dashboard", roles: ["admin", "user"] },
    { prefix: "/admin", roles: ["admin"] },
];

export async function middleware(req: NextRequest) {
    const route = protectedRoutes.find((r) =>
        req.nextUrl.pathname.startsWith(r.prefix)
    );

    if (!route) return NextResponse.next();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (
        !token ||
        !token.role ||
        !route.roles.includes(token.role as string) ||
        (token.exp && Date.now() >= (token.exp as number) * 1000)
    ) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: protectedRoutes.map((r) => `${r.prefix}/:path*`),
};