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

const SEARCH_KBD =
  "flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-border/70 bg-background px-1 font-sans text-[10px] font-medium leading-none text-muted-foreground/90 shadow-xs";

export function GlobalSearch() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = React.useState(false);

  const { menuModules } = usePermissions();

  const isMac = React.useMemo(
    () => typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.userAgent),
    []
  );

  const entries = React.useMemo(
    () => getSearchableMenuItems(user?.role ?? "", menuModules),
    [user?.role, menuModules]
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

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group hidden h-8 cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-muted/50 py-0 pl-2.5 pr-1.5 text-muted-foreground outline-none transition-colors hover:border-border/70 hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:inline-flex lg:w-56 xl:w-64"
        aria-label="Search pages"
        aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
      >
        <Search className="size-[1.05rem] shrink-0" />
        <span className="hidden truncate text-[13px] font-normal lg:inline">Search pages</span>
        <span className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">
          <kbd className={SEARCH_KBD}>{isMac ? "⌘" : "Ctrl"}</kbd>
          <kbd className={SEARCH_KBD}>K</kbd>
        </span>
      </button>

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
