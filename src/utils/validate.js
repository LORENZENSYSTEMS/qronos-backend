export function normalizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
}