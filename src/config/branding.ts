import envConfig from "@/config/envConfig";

// ─── Brand assets ────────────────────────────────────────────────────────────
// All three live in /public and ship to the site root at build time.

/** The "V" mark on its own. Favicon, PWA icon, sidebar and navbar. */
export const BRAND_MARK = "/brand-logo.png";

/** Stacked lockup — the mark above the Vertoone wordmark. Login screen. */
export const BRAND_LOCKUP = "/brand-company.png";

/** Horizontal Vertoone wordmark. Footers and "powered by" slots. */
export const COMPANY_WORDMARK = "/company-logo.png";

export const COMPANY_NAME = "Vertoone";
export const COMPANY_URL = "https://vertoone.com";

export const APP_NAME = envConfig.APP_NAME;
export const APP_SHORT_NAME = envConfig.APP_SHORT_NAME;
export const APP_TAGLINE = "SME Management Platform";
