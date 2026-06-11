import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Eye, Leaf, MapPin, Recycle, Sparkles, Truck, Zap, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-smartcity.jpg";
import { Particles } from "@/components/particles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Siga Verde — Rastreamento Inteligente da Coleta Urbana" },
      { name: "description", content: "Acompanhe em tempo real os caminhões da coleta urbana e participe de uma cidade mais limpa e sustentável." },
      { property: "og:title", content: "Siga Verde — Acompanhe a coleta. Transforme o futuro." },
      { property: "og:description", content: "Plataforma inteligente de rastreamento da coleta urbana para cidades sustentáveis." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <Particles count={22} />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-eco-light/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-smart-blue/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-eco-deep shadow-soft">
                <Sparkles className="h-3.5 w-3.5" /> Smart City · GovTech Sustentável
              </div>
              <h1 className="...">
  TESTE VERCEL 123456
</h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                Acompanhe os caminhões da coleta urbana e participe de uma cidade mais limpa e sustentável.
                Transparência pública, tecnologia inteligente e consciência ambiental em uma única plataforma.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/mapa"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-eco px-6 py-3.5 text-sm font-semibold text-white shadow-elegant transition-transform hover:scale-[1.02]"
                >
                  <MapPin className="h-4 w-4" /> Ver Mapa Agora
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/academia"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground shadow-soft hover:bg-secondary"
                >
                  <Leaf className="h-4 w-4 text-eco-mid" /> Aprender Sustentabilidade
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: "3", l: "Caminhões ativos" },
                  { v: "12", l: "Regiões" },
                  { v: "24/7", l: "Monitoramento" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl glass p-3 text-center shadow-soft">
                    <div className="font-display text-2xl font-bold text-gradient-eco">{s.v}</div>
                    <div className="text-[11px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-hero opacity-20 blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-elegant border border-white/40">
                <img
                  src={heroImg}
                  alt="Cidade inteligente com caminhão de coleta sustentável"
                  width={1536}
                  height={1152}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-elegant hidden sm:flex items-center gap-3 max-w-[260px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-eco shadow-soft">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Caminhão SV-01</div>
                  <div className="text-sm font-semibold">Centro · 4 min</div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-elegant hidden sm:flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-smart-blue shadow-soft">
                  <Recycle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Hoje</div>
                  <div className="text-sm font-semibold">412kg CO₂ poupados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-eco-light/20 px-3 py-1 text-xs font-semibold text-eco-deep">
              Tecnologia urbana
            </div>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Uma plataforma <span className="text-gradient-eco">completa</span> para cidades sustentáveis.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Visualização ao vivo, dashboards inteligentes e educação ambiental — tudo conectado.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Eye, title: "Rastreamento em tempo real", desc: "Veja a posição exata dos caminhões e estime a chegada na sua rua." },
              { icon: ShieldCheck, title: "Transparência pública", desc: "Dados abertos sobre rotas, horários e desempenho da coleta." },
              { icon: Leaf, title: "Educação ambiental", desc: "Conteúdos sobre reciclagem, compostagem e consumo consciente." },
              { icon: BarChart3, title: "Dados e indicadores", desc: "Métricas de eficiência, cobertura e impacto ambiental." },
              { icon: Zap, title: "Eficiência urbana", desc: "Otimize rotas, reduza custos e amplie a cobertura da coleta." },
              { icon: Sparkles, title: "Cidades inteligentes", desc: "Infraestrutura escalável pronta para integrar com sistemas municipais." },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-eco shadow-soft">
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <Particles count={18} />
        <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Pronto para transformar sua cidade?
          </h2>
          <p className="mt-5 text-lg text-white/85 max-w-2xl mx-auto">
            Apresente a Siga Verde à sua prefeitura ou explore a demonstração interativa agora mesmo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/mapa" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-eco-deep shadow-elegant hover:scale-[1.02] transition-transform">
              <MapPin className="h-4 w-4" /> Abrir Mapa ao Vivo
            </Link>
            <Link to="/sobre" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20">
              Conhecer o projeto <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
