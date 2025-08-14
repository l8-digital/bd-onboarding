export function formatNumbers(number: any) {
    if (number === null || number === undefined) return number;

    // Verifica se é um número direto
    if (typeof number === 'number') {
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    // Se for string, verifica se é um número válido (somente dígitos, ponto ou vírgula)
    if (typeof number === 'string') {
        // Troca vírgula por ponto e testa se é um número puro
        const clean = number.replace(',', '.').trim();

        // Regex: somente número com ponto opcional e até duas casas decimais
        const isValid = /^[+-]?(\d+(\.\d{0,})?)$/.test(clean);

        if (isValid) {
            const parsed = parseFloat(clean);
            return parsed.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        }
    }

    // Valor inválido (contém letras, símbolos, etc.)
    return number;
}
