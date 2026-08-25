import { COMPANY_URL, COMPANY_WORDMARK } from "@/config/branding";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background shrink-0 w-full text-center">
      <div className="px-4 pt-1 lg:px-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">All rights reserved &copy; {currentYear}</p>
          <a
            href={COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Powered by</span>
            <img
              src={COMPANY_WORDMARK}
              alt="Vertoone"
              className="h-2 w-auto group-hover:brightness-110"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
