/**
 * Format a dollar amount from raw number
 */
export function formatMoney(amount: number | null | undefined): string {
    if (amount == null) return "";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a date string to MM/DD/YYYY
 */
export function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
}

/**
 * Get full location string for an event
 */
export function formatLocation(
    venue: string | null,
    city: string | null,
    state: string | null,
    country: string | null
): string {
    return [venue, city, state, country].filter(Boolean).join(", ");
}

/**
 * Get horse short description (color + sex)
 */
export function horseHeadline(
    color: string | null,
    sex: string | null,
    birth_year: number | null,
    registry: string | null
): string {
    const parts = [color, sex].filter(Boolean).join(" ");
    const year = birth_year ? `• ${birth_year}` : "";
    const reg = registry ? `• ${registry}` : "";
    return [parts, year, reg].filter(Boolean).join(" ");
}

/**
 * Slug from string
 */
export function toSlug(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}
