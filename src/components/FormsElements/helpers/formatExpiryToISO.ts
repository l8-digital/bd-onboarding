export function formatExpiryToISO(expiry: string): string {
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Converte 2 dígitos para 4 (ex: '26' → 2026)
    const fullYear = year + (year < 100 ? 2000 : 0);

    // Retorna no formato "YYYY-MM"
    return `${fullYear}-${month.toString().padStart(2, '0')}`;
}