import * as React from "react";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNonPassiveScroll } from "@/hooks/use-non-passive-wheel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── A dependency-free command palette / combobox ───────────────────────────
//
// Reimplements the small slice of the `cmdk` API this app relies on (filtering,
// keyboard navigation, grouped items, empty state) so we can drop the external
// package. The exported component surface is unchanged, so existing consumers
// keep working: <Command>, <CommandInput>, <CommandList>, <CommandEmpty>,
// <CommandGroup>, <CommandItem>, <CommandSeparator>, <CommandShortcut>.

interface ItemReg {
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

interface CommandContextValue {
  search: string;
  setSearch: (s: string) => void;
  shouldFilter: boolean;
  isVisible: (value: string) => boolean;
  activeValue: string | null;
  setActiveValue: (v: string | null) => void;
  registerItem: (reg: ItemReg) => () => void;
  itemsRef: React.MutableRefObject<ItemReg[]>;
  version: number;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error("Command components must be used within <Command>");
  return ctx;
}

const matches = (value: string, search: string) =>
  value.toLowerCase().includes(search.trim().toLowerCase());

function Command({
  className,
  shouldFilter = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { shouldFilter?: boolean }) {
  const [search, setSearch] = React.useState("");
  const [activeValue, setActiveValue] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const itemsRef = React.useRef<ItemReg[]>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const isVisible = React.useCallback(
    (value: string) => !shouldFilter || search.trim() === "" || matches(value, search),
    [shouldFilter, search],
  );

  const registerItem = React.useCallback((reg: ItemReg) => {
    itemsRef.current.push(reg);
    setVersion((v) => v + 1);
    return () => {
      itemsRef.current = itemsRef.current.filter((i) => i !== reg);
      setVersion((v) => v + 1);
    };
  }, []);

  const visibleValues = React.useCallback(
    () => itemsRef.current.filter((i) => isVisible(i.value) && !i.disabled).map((i) => i.value),
    [isVisible],
  );

  // Keep the active (highlighted) item on something that is actually visible.
  React.useEffect(() => {
    const vis = visibleValues();
    if (vis.length === 0) {
      setActiveValue(null);
      return;
    }
    setActiveValue((cur) => (cur && vis.includes(cur) ? cur : vis[0]));
  }, [search, version, visibleValues]);

  const scrollIntoView = (value: string | null) => {
    if (!value || !listRef.current) return;
    const el = Array.from(
      listRef.current.querySelectorAll<HTMLElement>("[data-command-item]"),
    ).find((n) => n.dataset.value === value);
    el?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const vis = visibleValues();
    if (!vis.length) return;
    const idx = activeValue ? vis.indexOf(activeValue) : -1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = vis[(idx + 1) % vis.length];
      setActiveValue(next);
      scrollIntoView(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = vis[(idx - 1 + vis.length) % vis.length];
      setActiveValue(next);
      scrollIntoView(next);
    } else if (e.key === "Enter" && activeValue) {
      const item = itemsRef.current.find((i) => i.value === activeValue && !i.disabled);
      if (item) {
        e.preventDefault();
        item.onSelect?.(item.value);
      }
    }
  };

  const ctx: CommandContextValue = {
    search,
    setSearch,
    shouldFilter,
    isVisible,
    activeValue,
    setActiveValue,
    registerItem,
    itemsRef,
    version,
  };

  return (
    <CommandContext.Provider value={ctx}>
      <div
        data-slot="command"
        className={cn(
          "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
          className,
        )}
        onKeyDown={onKeyDown}
        {...props}
      >
        <CommandListRefProvider listRef={listRef}>{children}</CommandListRefProvider>
      </div>
    </CommandContext.Provider>
  );
}

// Share the list DOM ref with CommandList without widening the public context.
const ListRefContext = React.createContext<React.MutableRefObject<HTMLDivElement | null> | null>(
  null,
);
function CommandListRefProvider({
  listRef,
  children,
}: {
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return <ListRefContext.Provider value={listRef}>{children}</ListRefContext.Provider>;
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only" showCloseButton={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className={cn("overflow-hidden p-0", className)}>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const { search, setSearch } = useCommandContext();
  const controlled = value !== undefined;
  return (
    <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        value={controlled ? value : search}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          onValueChange?.(v);
        }}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  const listRef = React.useContext(ListRefContext);
  // Manual wheel + touch forwarding so the list scrolls inside modal popovers,
  // where react-remove-scroll swallows both wheel and touchmove (the latter is
  // why a command list inside a popover wouldn't scroll on mobile).
  const wheelRef = useNonPassiveScroll<HTMLDivElement>();

  return (
    <div
      data-slot="command-list"
      ref={(node) => {
        wheelRef(node);
        if (listRef) listRef.current = node;
      }}
      className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  // Re-renders whenever search/version change (context value identity changes).
  const { itemsRef, isVisible } = useCommandContext();
  const anyVisible = itemsRef.current.some((i) => isVisible(i.value));
  if (anyVisible) return null;
  return <div data-slot="command-empty" className={cn("py-6 text-center text-sm", className)} {...props} />;
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & { heading?: React.ReactNode }) {
  return (
    <div
      data-slot="command-group"
      className={cn("text-foreground overflow-hidden p-1", className)}
      {...props}
    >
      {heading && (
        <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium" data-command-group-heading>
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-separator" className={cn("bg-border -mx-1 h-px", className)} {...props} />;
}

function CommandItem({
  className,
  value = "",
  disabled,
  onSelect,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  value?: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}) {
  const { isVisible, activeValue, setActiveValue, registerItem } = useCommandContext();
  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;

  // Register so keyboard nav / Enter can find this item even while filtered.
  React.useLayoutEffect(() => {
    return registerItem({ value, disabled, onSelect: (v) => onSelectRef.current?.(v) });
  }, [value, disabled, registerItem]);

  if (!isVisible(value)) return null;
  const selected = activeValue === value;

  return (
    <div
      data-slot="command-item"
      data-command-item=""
      data-value={value}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      role="option"
      aria-selected={selected}
      onMouseMove={() => {
        if (!disabled) setActiveValue(value);
      }}
      onClick={() => {
        if (!disabled) onSelect?.(value);
      }}
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
