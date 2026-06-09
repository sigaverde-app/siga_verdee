import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Leaf, Loader2, Mail, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, roleHomePath } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Siga Verde" },
      { name: "description", content: "Acesse a plataforma Siga Verde para acompanhar a coleta urbana." },
    ],
  }),
  component: AuthPage,
});

type Tab = "login" | "signup" | "forgot";

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Informe seu nome").max(100);
const phoneSchema = z.string().trim().max(20).optional();

function AuthPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("login");

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: roleHomePath(role), replace: true });
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-soft overflow-hidden px-4 py-10">
      <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-eco-light/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-smart-blue/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-eco shadow-elegant">
            <Leaf className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Siga<span className="text-gradient-eco">Verde</span>
          </h1>
          <p className="text-sm text-muted-foreground">Acesso à plataforma inteligente</p>
        </div>

        <div className="glass rounded-3xl p-6 shadow-elegant">
          <div className="flex gap-1 rounded-xl bg-secondary/70 p-1 mb-5">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  tab === t ? "bg-white text-eco-deep shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          {tab === "login" && <LoginForm onForgot={() => setTab("forgot")} />}
          {tab === "signup" && <SignupForm onDone={() => setTab("login")} />}
          {tab === "forgot" && <ForgotForm onBack={() => setTab("login")} />}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          toast.error("Falha ao entrar com Google", { description: result.error.message });
          setBusy(false);
        }
        // redirect/success: page reloads via OAuth flow
      }}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft hover:bg-secondary transition disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
      )}
      {label}
    </button>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : "Dados inválidos";
      toast.error(msg);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const msg = error.message.includes("Email not confirmed")
        ? "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
        : error.message.includes("Invalid login")
        ? "E-mail ou senha incorretos."
        : error.message;
      toast.error("Não foi possível entrar", { description: msg });
      return;
    }
    toast.success("Bem-vindo de volta!");
    // Role lookup + redirect happens via /auth's effect when user appears
    navigate({ to: "/painel", replace: true });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} autoComplete="email" />
      <PasswordField value={password} onChange={setPassword} show={showPwd} setShow={setShowPwd} autoComplete="current-password" />
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-eco px-4 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Entrar
      </button>
      <button type="button" onClick={onForgot} className="block w-full text-center text-xs text-muted-foreground hover:text-foreground">
        Esqueci minha senha
      </button>
      <Divider />
      <GoogleButton label="Entrar com Google" />
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(name);
      emailSchema.parse(email);
      passwordSchema.parse(password);
      phoneSchema.parse(phone);
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : "Dados inválidos";
      toast.error(msg);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    setBusy(false);
    if (error) {
      const msg = error.message.includes("already")
        ? "Este e-mail já está cadastrado."
        : error.message;
      toast.error("Falha no cadastro", { description: msg });
      return;
    }
    toast.success("Cadastro realizado!", {
      description: "Enviamos um e-mail de confirmação. Confirme para liberar o acesso.",
    });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field icon={UserIcon} type="text" placeholder="Nome completo" value={name} onChange={setName} autoComplete="name" />
      <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} autoComplete="email" />
      <Field icon={Phone} type="tel" placeholder="Telefone (opcional)" value={phone} onChange={setPhone} autoComplete="tel" />
      <PasswordField value={password} onChange={setPassword} show={showPwd} setShow={setShowPwd} autoComplete="new-password" />
      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-3 w-3 text-eco-mid" /> Cadastro como cidadão. Motoristas são habilitados pelo administrador.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-eco px-4 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Criar conta
      </button>
      <Divider />
      <GoogleButton label="Cadastrar com Google" />
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (err) {
      toast.error(err instanceof z.ZodError ? err.issues[0].message : "E-mail inválido");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível enviar", { description: error.message });
      return;
    }
    toast.success("Verifique seu e-mail", { description: "Enviamos um link para redefinir sua senha." });
    onBack();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-muted-foreground">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
      <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} autoComplete="email" />
      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-eco px-4 py-3 text-sm font-semibold text-white shadow-elegant disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Enviar link de recuperação
      </button>
      <button type="button" onClick={onBack} className="block w-full text-center text-xs text-muted-foreground hover:text-foreground">
        ← Voltar para o login
      </button>
    </form>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, autoComplete }: { icon: typeof Mail; type: string; placeholder: string; value: string; onChange: (v: string) => void; autoComplete?: string }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-eco-mid focus:ring-2 focus:ring-eco-light/40 transition"
      />
    </div>
  );
}

function PasswordField({ value, onChange, show, setShow, autoComplete }: { value: string; onChange: (v: string) => void; show: boolean; setShow: (b: boolean) => void; autoComplete?: string }) {
  return (
    <div className="relative">
      <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Senha"
        className="w-full rounded-xl border border-border bg-white pl-10 pr-10 py-2.5 text-sm outline-none focus:border-eco-mid focus:ring-2 focus:ring-eco-light/40"
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
      <div className="relative flex justify-center text-[11px] uppercase tracking-widest"><span className="bg-white/80 px-2 text-muted-foreground">ou</span></div>
    </div>
  );
}
