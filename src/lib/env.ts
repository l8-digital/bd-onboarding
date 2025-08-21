import * as yup from "yup";

// `yup.string().url()` does not accept `localhost` as a valid host.
// NextAuth is frequently used in development with URLs such as
// `http://localhost:3000`, therefore a small helper is used to validate
// using the `URL` constructor instead of Yup's built-in check.
const isUrl = (value?: string) => {
    if (!value) return false;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const envSchema = yup.object({
    NEXTAUTH_URL: yup
        .string()
        .default("http://localhost:3000")
        .test("is-url", "NEXTAUTH_URL must be a valid URL", isUrl),
    API_URL: yup
        .string()
        .default("http://localhost:3333")
        .test("is-url", "API_URL must be a valid URL", isUrl),
});

const envVars = envSchema.validateSync({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    API_URL: process.env.API_URL,
});

export const env = envVars;
