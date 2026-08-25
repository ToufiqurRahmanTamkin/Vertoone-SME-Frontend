import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/config/branding";
import { selectCurrentUser } from "@/redux/authSlice";
import { LayoutDashboard, Palette, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";

// Placeholder console home. Each module built from here replaces one of these
// cards with its own summary and adds its entry to `config/navigation.ts`.
const STARTER_CARDS = [
  {
    icon: ShieldCheck,
    title: "Super admin access",
    description:
      "The platform has exactly one account, provisioned from the backend environment and re-seeded on every server start.",
  },
  {
    icon: Palette,
    title: "Theme & colour",
    description:
      "Open the Customizer in the navbar to switch presets, colour mode, radius, typography and sidebar layout.",
  },
  {
    icon: LayoutDashboard,
    title: "Modules",
    description:
      "This console is the template for the modules that follow. Add each one to the navigation config and it appears here.",
  },
];

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name ?? "Super Admin"}`}
        description={`${APP_NAME} console. Modules will appear here as they are built.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {STARTER_CARDS.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p className="font-medium">{user?.role}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last login</p>
            <p className="font-medium">
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
