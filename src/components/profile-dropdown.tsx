import { KeyRound, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutMutation } from "@/redux/apis/authApi";
import { logOut, selectCurrentUser } from "@/redux/authSlice";
import { baseApi } from "@/redux/baseApi";
import { ChangePasswordDialog } from "./change-password-dialog";
import * as React from "react";

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "SA";

export function ProfileDropdown() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [passwordOpen, setPasswordOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout().unwrap().catch(() => undefined);
    dispatch(logOut());
    dispatch(baseApi.util.resetApiState());
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer rounded-full">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="gap-2">
            <User className="size-4" />
            Super Admin
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => setPasswordOpen(true)}>
            <KeyRound className="size-4" />
            Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onSelect={handleLogout}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}
