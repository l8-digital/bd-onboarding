import { env } from "@/lib/env";

export interface LoginResponse {
    id: string;
    name: string;
    email: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
}

export async function loginRequest(
    email: string,
    password: string
): Promise<LoginResponse | null> {
    try {
        const res = await fetch(`${env.API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        return (await res.json()) as LoginResponse;
    } catch (error) {
        console.error("Login request error", error);
        return null;
    }
}
