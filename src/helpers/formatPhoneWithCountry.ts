export function formatPhoneWithCountry(value: string): string {
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  // Detecta se começa com DDI (assumindo que tenha mais de 11 dígitos)
  // Ex: +55 (Brasil), +1 (EUA), +351 (Portugal)
  let countryCode = "";
  let rest = digits;

  // Para simplificar: vamos assumir que DDI tem 1 a 3 dígitos
  if (digits.length > 11) {
    countryCode = digits.slice(0, digits.length - 10 - (digits.length > 12 ? 1 : 0));
    // Melhor: vamos extrair os 2 ou 3 primeiros como DDI
    // Se Brasil (+55), restará 11 dígitos no "rest"
    if (countryCode.length > 3) {
      countryCode = digits.slice(0, 2); // fallback
    }
    rest = digits.slice(countryCode.length);
  }

  // Aplica máscara no número local
  let formattedLocal = "";
  if (rest.length <= 10) {
    // (00) 0000-0000
    formattedLocal = rest
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14);
  } else {
    // (00) 00000-0000
    formattedLocal = rest
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
  }

  // Retorna com o DDI formatado
  return countryCode ? `+${countryCode} ${formattedLocal}` : formattedLocal;
}
