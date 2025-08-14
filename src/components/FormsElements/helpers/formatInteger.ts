export function formatInteger(
    value: number | string | null | undefined,
    min: number = 0,
    max: number = Infinity
): { value: number; masked: string } {
    if (value === '' || value === null || value === undefined) {
        return {
            value: 0,
            masked: ''
        };
    }

    // Remove tudo que não for número
    const raw =
        typeof value === 'string'
            ? value.replace(/\D/g, '')
            : String(Math.floor(Number(value ?? 0)));

    let numeric = parseInt(raw || '0', 10);

    // Aplica os limites definidos
    numeric = Math.max(min, Math.min(numeric, max));

    return {
        value: numeric,
        masked: numeric.toString()
    };
}
