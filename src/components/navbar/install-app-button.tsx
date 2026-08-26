import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePwaInstall } from "@/hooks/use-pwa";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

export function InstallAppButton() {
  const { canInstall, needsManualInstall, promptInstall } = usePwaInstall();

  if (!canInstall && !needsManualInstall) return null;

  const showIosInstructions = () => {
    toast.info("Install Vertoone SME", {
      description: "Tap the Share button in Safari, then choose “Add to Home Screen”.",
      duration: 8000,
    });
  };

  const handleClick = async () => {
    if (needsManualInstall) {
      showIosInstructions();
      return;
    }
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("Vertoone SME installed");
    }
  };

  const Icon = needsManualInstall ? Share : Download;
  const label = needsManualInstall ? "How to install this app" : "Install this app";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="size-9 cursor-pointer rounded-full text-primary hover:text-primary"
          aria-label={label}
        >
          <Icon className="size-[1.15rem]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
