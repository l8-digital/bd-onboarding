export function formatCurrencyCodeLanguage(lang: string): string {
    const currencyMap: Record<string, { locale: string}> = {
        'pt-BR': { locale: 'brl' },
        en: { locale: 'usd'},
        es: { locale: 'eur'},
    };

    return currencyMap[lang].locale || 'brl'; // fallback para 'BRL'
}
