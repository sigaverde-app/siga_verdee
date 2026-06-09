import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, roleHomePath } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    // Role-based access control
    if (pathname.startsWith("/admin") && role !== "administrador") {
      navigate({ to: roleHomePath(role), replace: true });
    }
    if (pathname.startsWith("/motorista") && role !== "motorista" && role !== "administrador") {
      navigate({ to: roleHomePath(role), replace: true });
    }
  }, [user, role, loading, pathname, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-soft">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
        </div>
      </div>
    );
  }

  return <Outlet />;
}
