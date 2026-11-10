/** A deliberately loose email check (one @, a dot after it, no spaces). Formspree validates again on the server. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string): boolean => EMAIL.test(value.trim());
