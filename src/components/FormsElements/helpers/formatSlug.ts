export function formatSlug(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')       // remove acentos
        .replace(/[^a-z0-9\s-]/g, '')          // permite letras, números, espaço e hífen manual
        .replace(/\s+/g, '-')                  // espaços → hífen
}