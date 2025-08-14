export function formatExpiry(value: string): string {
    let digits = (value || '').replace(/\D/g, '');

    // Corrige mês com 1 dígito maior que 1 (ex: 3 → 03)
    if (digits.length === 1 && parseInt(digits[0], 10) > 1) {
        digits = '0' + digits;
    }

    // Limita a 4 dígitos (MMYY)
    digits = digits.slice(0, 4);

    // Formatação condicional
    if (digits.length === 0) return '';
    if (digits.length < 3) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
