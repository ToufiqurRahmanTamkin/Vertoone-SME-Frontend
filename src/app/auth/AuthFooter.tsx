import { COMPANY_NAME, COMPANY_URL, COMPANY_WORDMARK } from "@/config/branding";
import { motion } from "motion/react";

/**
 * Footer strip shared by the auth screens: a hairline divider, the Vertoone
 * brand mark linking to the marketing site, and a copyright line.
 */
export function AuthFooter() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="relative z-10 mt-8 w-full max-w-lg lg:mt-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mt-5 flex flex-col items-center gap-3 lg:mt-3">
        <a
          href={COMPANY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center opacity-70 transition-opacity hover:opacity-100"
          aria-label={`${COMPANY_NAME} — visit website`}
        >
          <img src={COMPANY_WORDMARK} alt={COMPANY_NAME} className="h-5 w-auto object-contain" />
        </a>

        <p className="text-center text-[11px] text-muted-foreground">
          &copy; {year} {COMPANY_NAME}. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
