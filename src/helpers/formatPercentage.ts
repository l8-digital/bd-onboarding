export function formatPercentage(
    value: number | string | null | undefined
): { value: number; masked: string } {
    const raw =
        typeof value === 'string'
            ? value.replace(/\D/g, '') // remove tudo que não for número
            : String(Math.floor(Number(value ?? 0)));

    const numeric = parseInt(raw || '0', 10);

    // Convertido para decimal
    let float = numeric / 100;

    // Limita entre 0 e 100
    float = Math.min(Math.max(0, float), 100);

    return {
        value: Math.round(float * 100), // ex: 1.23 → 123
        masked: float.toFixed(2),       // "1.23" ← com ponto decimal
    };
}