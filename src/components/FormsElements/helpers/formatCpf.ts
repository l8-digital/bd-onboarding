export function formatCpf(value: string): string {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    let cpf = digits;
    if (digits.length > 3) {
        cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}`;
    }
    if (digits.length > 6) {
        cpf += `.${digits.slice(6, 9)}`;
    }
    if (digits.length > 9) {
        cpf += `-${digits.slice(9, 11)}`;
    }
    return cpf;
}

export function isValidCpf(value: string): boolean {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length !== 11 || /^(\\d)\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
    let first = (sum * 10) % 11;
    if (first === 10) first = 0;
    if (first !== parseInt(digits.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
    let second = (sum * 10) % 11;
    if (second === 10) second = 0;
    return second === parseInt(digits.charAt(10));
}
