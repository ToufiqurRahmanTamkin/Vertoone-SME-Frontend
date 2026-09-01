import { cn } from "@/lib/utils";

interface FieldIconProps {
  name: string;
  icons: Record<string, string>;
  className?: string;
}

export function FieldIcon({ name, icons, className }: FieldIconProps) {
  const paths = icons[name];
  if (!paths) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-4", className)}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
