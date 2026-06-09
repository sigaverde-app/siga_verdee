import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["cidadao", "motorista", "administrador"]);

async function ensureAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "administrador")
    .maybeSingle();
  if (error) throw new Error("Falha ao verificar permissões");
  if (!data) throw new Error("Acesso negado: apenas administradores");
}

export const listUsersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role as string);
      roleMap.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
  });

export const setUserRoleAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "cidadao" | "motorista" | "administrador" }) => ({
    userId: z.string().uuid().parse(input.userId),
    role: roleSchema.parse(input.role),
  }))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Replace all roles with the new single role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const seedDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Idempotent: only run if no admin exists yet
  const { data: existingAdmin } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "administrador")
    .limit(1)
    .maybeSingle();
  if (existingAdmin) {
    return { ok: true, created: 0, message: "Demo já configurado." };
  }

  const demos: Array<{ email: string; password: string; role: "cidadao" | "motorista" | "administrador"; name: string }> = [
    { email: "cidadao@sigaverde.demo", password: "Sigaverde@2026", role: "cidadao", name: "Maria Cidadã (Demo)" },
    { email: "motorista@sigaverde.demo", password: "Sigaverde@2026", role: "motorista", name: "João Motorista (Demo)" },
    { email: "admin@sigaverde.demo", password: "Sigaverde@2026", role: "administrador", name: "Admin Siga Verde (Demo)" },
  ];

  let created = 0;
  for (const d of demos) {
    const { data: u, error } = await supabaseAdmin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { full_name: d.name },
    });
    if (error || !u?.user) {
      // probably already exists — try to fetch id
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users.find((x) => x.email === d.email);
      if (!existing) continue;
      await supabaseAdmin.from("user_roles").delete().eq("user_id", existing.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: existing.id, role: d.role });
      continue;
    }
    // Trigger inserts default cidadao role; replace with intended role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", u.user.id);
    await supabaseAdmin.from("user_roles").insert({ user_id: u.user.id, role: d.role });
    created++;
  }
  return { ok: true, created, message: `${created} contas criadas.` };
});
