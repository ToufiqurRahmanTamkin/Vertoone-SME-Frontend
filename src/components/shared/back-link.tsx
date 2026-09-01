import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackLinkProps {
  to: string;
  label: string;
  variant?: "ghost" | "outline";
  className?: string;
}

export function BackLink({ to, label, variant = "ghost", className }: BackLinkProps) {
  return (
    <Button variant={variant} size="sm" className={cn("shrink-0", className)} asChild>
      <Link to={to}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  );
}

export default BackLink;
