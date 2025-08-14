export function formatCurrencyByLanguage(value: number, lang: string): string {
    const optionsMap: Record<string, { locale: string; currency: string }> = {
        pt: { locale: 'pt-BR', currency: 'BRL' },
        en: { locale: 'en-US', currency: 'USD' },
        es: { locale: 'es-ES', currency: 'USD' }, // ou 'EUR'
    };

    const { locale, currency } = optionsMap[lang] || optionsMap['pt'];

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(value / 100);
}