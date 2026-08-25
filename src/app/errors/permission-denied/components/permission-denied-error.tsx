import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PermissionDeniedError() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:p-16">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="size-10 text-destructive" />
      </div>
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">403</h1>
        <h2 className="mb-3 text-2xl font-semibold">Permission Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
          <br />
          Contact your administrator if you believe this is a mistake.
        </p>
        <div className="mt-6 flex items-center justify-center md:mt-8">
          <Button className="cursor-pointer" onClick={() => navigate("/dashboard")}>
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  );
}
