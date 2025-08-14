"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";

const schema = Yup.object({
    email: Yup.string().email("Email inválido").required("Campo obrigatório"),
});

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data: any) => {
        // Aqui você chamaria sua API para enviar e-mail de redefinição
        await new Promise((r) => setTimeout(r, 1000));
        setSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white p-8 rounded shadow-md"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">Redefinir senha</h1>

                {sent ? (
                    <p className="text-green-600 text-center">
                        Se o e-mail existir, você receberá instruções.
                    </p>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                E-mail
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                        >
                            {isSubmitting ? "Enviando..." : "Enviar link"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
