export function formatPhone(value: string): string {
  // Remove tudo que não for número
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 10) {
    // Formato (00) 0000-0000
    return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14); // garante que não extrapole
  } else {
    // Formato (00) 00000-0000
    return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
  }
}