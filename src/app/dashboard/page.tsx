// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return(
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-3xl mx-auto bg-white shadow rounded p-8">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p className="text-gray-700">
                    Bem-vindo, <strong>{session.user.name}</strong> 👋
                </p>
                <p className="text-sm text-gray-500 mt-1">Seu email: {session.user.email}</p>
            </div>
        </div>
    );
}
