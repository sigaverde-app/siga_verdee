import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck, Sparkles, Truck, UserCog, Users } from "lucide-react";
import { listUsersAdmin, setUserRoleAdmin, seedDemoAccounts } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Siga Verde" }] }),
  component: AdminPanel,
});

type Role = "cidadao" | "motorista" | "administrador";

function AdminPanel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const listFn = useServerFn(listUsersAdmin);
  const setRoleFn = useServerFn(setUserRoleAdmin);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listFn(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { userId: string; role: Role }) => setRoleFn({ data: vars }),
    onSuccess: () => { toast.success("Papel atualizado"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = (users ?? []).reduce(
    (acc, u) => {
      const r = (u.roles[0] ?? "cidadao") as Role;
      acc[r] = (acc[r] ?? 0) + 1;
      return acc;
    },
    { cidadao: 0, motorista: 0, administrador: 0 } as Record<Role, number>,
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="animate-fade-up">
          <p className="text-sm text-muted-foreground">Painel Administrativo</p>
          <h1 className="font-display text-3xl font-bold">
            Olá, <span className="text-gradient-eco">{user?.user_metadata?.full_name ?? "admin"}</span>
          </h1>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Cidadãos", value: counts.cidadao, icon: Users, color: "from-eco-mid to-eco-light" },
            { label: "Motoristas", value: counts.motorista, icon: Truck, color: "from-smart-blue to-eco-mid" },
            { label: "Administradores", value: counts.administrador, icon: ShieldCheck, color: "from-eco-deep to-eco-mid" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} shadow-soft`}><c.icon className="h-5 w-5 text-white" /></div>
              <div className="mt-3 font-display text-3xl font-bold">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <header className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2"><UserCog className="h-4 w-4 text-eco-mid" /><h3 className="font-display font-bold">Gerenciar usuários</h3></div>
            <span className="text-xs text-muted-foreground">{users?.length ?? 0} cadastrados</span>
          </header>
          {isLoading && <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>}
          {error && <div className="p-6 text-sm text-destructive">Erro: {(error as Error).message}</div>}
          {users && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Nome</th>
                    <th className="px-5 py-3 text-left">E-mail</th>
                    <th className="px-5 py-3 text-left">Telefone</th>
                    <th className="px-5 py-3 text-left">Papel</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const currentRole = (u.roles[0] ?? "cidadao") as Role;
                    return (
                      <tr key={u.id} className="border-t border-border">
                        <td className="px-5 py-3 font-medium">{u.full_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                        <td className="px-5 py-3">
                          <select
                            value={currentRole}
                            disabled={mutation.isPending}
                            onChange={(e) => mutation.mutate({ userId: u.id, role: e.target.value as Role })}
                            className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold focus:border-eco-mid focus:ring-2 focus:ring-eco-light/40"
                          >
                            <option value="cidadao">Cidadão</option>
                            <option value="motorista">Motorista</option>
                            <option value="administrador">Administrador</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <DemoSeedCard />
      </div>
    </div>
  );
}

function DemoSeedCard() {
  const seedFn = useServerFn(seedDemoAccounts);
  const [busy, setBusy] = useState(false);
  return (
    <section className="mt-8 rounded-2xl border border-eco-light/40 bg-eco-light/10 p-5 shadow-soft">
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-eco-deep" /><h3 className="font-display font-bold">Contas de demonstração</h3></div>
      <p className="mt-1 text-sm text-muted-foreground">
        Cria três contas pré-confirmadas para apresentações: <strong>cidadao@sigaverde.demo</strong>, <strong>motorista@sigaverde.demo</strong>, <strong>admin@sigaverde.demo</strong> — todas com senha <code className="rounded bg-white px-1.5 py-0.5">Sigaverde@2026</code>.
      </p>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await seedFn();
            toast.success("Contas de demonstração", { description: r.message });
          } catch (e) {
            toast.error("Falha", { description: (e as Error).message });
          } finally { setBusy(false); }
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-eco px-4 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Criar/atualizar contas de demo
      </button>
    </section>
  );
}
