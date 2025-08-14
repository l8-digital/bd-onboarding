export function formatDocInput(v: string, onlyCnpj?: boolean) {
  // Remove caracteres não numéricos
  v = v.replace(/\D/g, "");

  // Formatação para CPF (até 11 dígitos)
  if (v.length <= 11 && !onlyCnpj) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // Formatação para CNPJ (mais de 11 dígitos)
  else {
    v = v.replace(/(\d{2})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1/$2");
    v = v.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  return v;
}
