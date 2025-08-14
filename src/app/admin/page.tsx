import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-3xl mx-auto bg-white shadow rounded p-8">
                <h1 className="text-2xl font-bold mb-4">Admin</h1>
                <p className="text-gray-700">Área restrita para administradores.</p>
            </div>
        </div>
    );
}
