import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { getSearchableMenuItems } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { selectCurrentUser } from "@/redux/authSlice";
import { Search } from "lucide-react";
import * as React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function GlobalSearch() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = React.useState(false);

  const { modules } = usePermissions();

  const entries = React.useMemo(
    () => getSearchableMenuItems(user?.role ?? "", modules),
    [user?.role, modules]
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const groups = React.useMemo(() => {
    const byGroup = new Map<string, typeof entries>();
    entries.forEach((entry) => {
      byGroup.set(entry.group, [...(byGroup.get(entry.group) ?? []), entry]);
    });
    return [...byGroup.entries()];
  }, [entries]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 cursor-pointer justify-start gap-2 rounded-full bg-muted/40 px-3 text-muted-foreground hover:bg-muted md:w-56 lg:w-72"
        aria-label="Search pages"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden truncate text-sm font-normal md:inline">Search pages...</span>
        <CommandShortcut className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-block">
          Ctrl K
        </CommandShortcut>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Jump to any page in the console."
      >
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No matching page.</CommandEmpty>
          {groups.map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`${item.title} ${item.path}`}
                  onSelect={() => go(item.path)}
                >
                  {item.icon && <item.icon className="mr-2 size-4 shrink-0" />}
                  <span className="truncate">{item.title}</span>
                  <CommandShortcut className="font-mono text-[11px]">{item.path}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
