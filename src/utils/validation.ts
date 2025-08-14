// import { isValidPhoneNumber } from 'libphonenumber-js';
import * as yup from 'yup';
const requiredMsg = 'Este campo é obrigatório';
const emailMsg = 'Formato de e-mail inválido';

export function isValidCnpj(cnpj: string): boolean {
    if (!cnpj) return false;

    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleanedCnpj)) return false;
  
    let size = cleanedCnpj.length - 2;
    let numbers = cleanedCnpj.substring(0, size);
    const digits = cleanedCnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
  
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
  
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== parseInt(digits.charAt(0))) return false;
  
    size = size + 1;
    numbers = cleanedCnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
  
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
  
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== parseInt(digits.charAt(1))) return false;
  
    return true;
  }

export function isValidCpf(cpf: string): boolean {
    if (!cpf) return false;
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11 || /^(\d)\1+$/.test(cleanedCpf)) return false;

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanedCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanedCpf.substring(10, 11))) return false;

    return true;
  }

// const limparNumeros = (valor?: string): string => {
//   if (!valor) return '';
//   return valor.replace(/\D/g, "");
// }

export const payrollValidator = yup
  .string()
  .required(requiredMsg)
  .test(
    'is-positive-payroll',
    'O valor deve ser maior que R$ 0,00',
    (value) => {
      if (!value) return false; 
      const valorNumerico = Number(
        value
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .trim()
      );
      
      return !isNaN(valorNumerico) && valorNumerico > 0;
    }
  );

export const emailValidator = yup
  .string()
  .trim()
  .lowercase()
  .required(requiredMsg)
  .test('is-valid-email', emailMsg, (value) => {
    if (!value) return true;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(value);
  });

export const requiredString = yup
  .string()
  .required(requiredMsg);

/*export const phoneValidator = yup
    .string()
    .required(requiredMsg)
    .test(
        'is-valid-phone',
        'Número de telefone inválido',
        (value) => {
            if (!value) return true;
            return isValidPhoneNumber(value);
        }
    );*/

  export const cnpjValidator = yup
  .string()
  .required(requiredMsg)
  .test('is-valid-cnpj', 'CNPJ inválido', (value) => {
    if (!value) return true;
    return isValidCnpj(value);
  });

  export const cpfValidator = yup
  .string()
  .required(requiredMsg)
  .test('is-valid-cpf', 'CPF inválido', (value) => {
    if (!value) return true;
    return isValidCpf(value); 
  });

  export const requiredNumber = yup
  .number()
  .transform((value, originalValue) => {
    return String(originalValue).trim() === '' ? undefined : value;
  })
  .required(requiredMsg);
/*
export const addressSchema = yup.object({
    zipcode: requiredString,
    state: requiredString,
    city_id: requiredString,
    line: requiredString,
    building_number: requiredString,
    neighborhood: requiredString,
  });

  export const rhSchema = yup.object({
    email: emailValidator,
    phone: phoneValidator,
  });
export const legalRepresentativeSchema = yup.object({
    name: requiredString,
    document: cpfValidator,
    phone: phoneValidator,
    email: emailValidator,
  });

  export const mainFormSchema = yup.object({
    social_name: requiredString,
    fantasy_name: yup.string(),
    document: cnpjValidator,
    phone: phoneValidator, 
    email: emailValidator,
    number_of_employees: requiredNumber.min(1, 'O número deve ser maior que zero'),
    payroll: payrollValidator,
    
    addresses: yup
      .array()
      .of(addressSchema)
      .min(1, "É necessário adicionar pelo menos um endereço.")
      .required(),
  
    rhs: yup
      .array()
      .of(rhSchema)
      .min(1, "É necessário adicionar pelo menos um contato de RH.")
      .required(),
      
    legal_representatives: yup
      .array()
      .of(legalRepresentativeSchema)
      .min(1, "É necessário adicionar pelo menos um representante legal.")
      .required(),
  });*/

// Aceita celular (11 dígitos) e fixo (10 dígitos) com ou sem +55
export function isValidPhoneBR(input: string | null | undefined): boolean {
    if (!input) return false;

    // Remove tudo que não for número
    const digits = String(input).replace(/\D+/g, "");

    // Remove prefixo do Brasil se presente
    const local = digits.startsWith("55") ? digits.slice(2) : digits;

    // Quantidade válida: 10 (fixo) ou 11 (celular) dígitos
    if (local.length !== 10 && local.length !== 11) return false;

    const ddd = local.slice(0, 2);
    const num = local.slice(2);

    // DDD não pode começar com 0
    if (ddd.startsWith("0")) return false;

    // Celular no Brasil (11 dígitos) deve começar com 9
    if (local.length === 11 && num[0] !== "9") return false;

    // Evita números como 0000000000 ou 99999999999
    if (/^(\d)\1+$/.test(local)) return false;

    return true;
}
