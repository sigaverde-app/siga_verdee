import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Leaf, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Redefinir senha — Siga Verde" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery session via URL fragment automatically
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("A senha deve ter no mínimo 6 caracteres"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error("Falha ao redefinir", { description: error.message }); return; }
    toast.success("Senha atualizada com sucesso!");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-soft px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-eco shadow-elegant">
            <Leaf className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Redefinir senha</h1>
        </div>
        <div className="glass rounded-3xl p-6 shadow-elegant">
          {!ready ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Validando link...</div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="w-full rounded-xl border border-border bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-eco-mid focus:ring-2 focus:ring-eco-light/40"
                />
              </div>
              <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-eco px-4 py-3 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Atualizar senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
