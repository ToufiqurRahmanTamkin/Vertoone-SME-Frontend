import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/redux/apis/authApis";
import { logOut, selectCurrentUser } from "@/redux/authSlice";
import { ChevronsUpDown, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [logoutApi] = useLogoutMutation();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // The server has no session state to drop — clearing locally is enough.
    } finally {
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  const initials = user.name
    ?.split(" ")
    ?.map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* Identity chip: avatar + name + email. The text collapses away below
            `sm` so the navbar keeps its icon-only footprint on a phone. */}
        <button
          type="button"
          aria-label={`Account menu — ${user.name}, ${user.email}`}
          className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-transparent p-1 transition-all hover:border-border hover:bg-accent focus:outline-none active:scale-95 xl:pr-2.5"
        >
          <Avatar className="h-8 w-8 shrink-0">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-linear-to-br from-primary via-primary/80 to-primary/60 text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col items-start text-left leading-tight xl:flex">
            <span className="max-w-[9rem] truncate text-xs font-semibold text-foreground">
              {user.name}
            </span>
            <span className="max-w-[9rem] truncate text-[11px] text-muted-foreground">
              {user.email}
            </span>
          </span>
          <ChevronsUpDown className="hidden h-3.5 w-3.5 shrink-0 opacity-50 xl:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm"
      >
        <DropdownMenuLabel className="mb-2 flex flex-col gap-2 rounded-lg bg-accent/50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0 rounded-lg">
              {user.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name}
                  className="rounded-lg object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-lg bg-linear-to-br from-primary via-primary/80 to-primary/60 text-xs font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1.5 text-[11px] font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Super Admin</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => navigate("/settings/account")}
          className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 transition-colors hover:bg-accent"
        >
          <Settings className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-sm font-medium text-foreground">Account</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-500/10 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
