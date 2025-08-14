export function formatCurrency2(
    value: number | string | null | undefined
): { value: number; masked: string } {
    const raw =
        typeof value === 'string'
            ? value.replace(/\D/g, '') // ← CORRETO: remove tudo que não for dígito
            : String(Math.floor(Number(value ?? 0)));

    const numeric = parseInt(raw || '0', 10);
    const float = numeric / 100;

    return {
        value: numeric,
        masked: float.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }),
    };
}
