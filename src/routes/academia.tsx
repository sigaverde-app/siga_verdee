import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Globe2, Leaf, Lightbulb, Recycle, Sprout, Trash2, TreePine, Zap } from "lucide-react";

export const Route = createFileRoute("/academia")({
  head: () => ({
    meta: [
      { title: "Academia Verde — Siga Verde" },
      { name: "description", content: "Aprenda sobre reciclagem, compostagem, economia circular e consumo consciente." },
      { property: "og:title", content: "Academia Verde — Educação Ambiental" },
      { property: "og:description", content: "Conteúdos educativos sobre sustentabilidade urbana." },
    ],
  }),
  component: Academia,
});

const topics = [
  { icon: Recycle, title: "Reciclagem", desc: "Como separar corretamente vidro, plástico, papel e metal para a coleta seletiva.", color: "from-eco-deep to-eco-mid" },
  { icon: Sprout, title: "Compostagem", desc: "Transforme resíduos orgânicos em adubo natural e reduza o lixo em até 50%.", color: "from-eco-mid to-eco-light" },
  { icon: Globe2, title: "Economia Circular", desc: "Modelo regenerativo que mantém produtos e materiais em uso por mais tempo.", color: "from-smart-blue to-eco-mid" },
  { icon: Lightbulb, title: "Consumo Consciente", desc: "Escolhas diárias que reduzem o impacto ambiental e geram economia.", color: "from-eco-light to-smart-blue" },
  { icon: BookOpen, title: "Educação Ambiental", desc: "Pequenas mudanças geram grandes resultados quando multiplicadas em comunidade.", color: "from-eco-deep to-smart-blue" },
  { icon: TreePine, title: "Biodiversidade Urbana", desc: "A coleta eficiente protege ecossistemas locais e qualidade do ar.", color: "from-eco-mid to-eco-deep" },
];

const tips = [
  "Lave embalagens recicláveis antes de descartar.",
  "Separe pilhas e eletrônicos — eles têm coleta específica.",
  "Use sacolas retornáveis e evite descartáveis.",
  "Composte cascas de frutas, borra de café e folhas secas.",
  "Doe roupas e objetos antes de descartar.",
  "Reduza o consumo de plástico de uso único.",
];

const stats = [
  { icon: Recycle, value: "1 tonelada", label: "de papel reciclado preserva 17 árvores e 50 mil litros de água." },
  { icon: Zap, value: "95%", label: "menos energia é necessária para reciclar alumínio do que produzi-lo do zero." },
  { icon: Globe2, value: "1 milhão", label: "de toneladas de CO₂ podem ser evitadas com coleta seletiva eficiente." },
];

function Academia() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-soft py-20">
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-eco-light/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-eco-deep shadow-soft">
            <Leaf className="h-3.5 w-3.5" /> Academia Verde
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Conhecimento que <span className="text-gradient-eco">transforma</span> a cidade.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Conteúdos educativos sobre reciclagem, compostagem e consumo consciente — desenhados para quem quer
            fazer parte da mudança.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <article key={t.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} shadow-soft`}>
                  <t.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{t.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-eco-light/10 transition-transform group-hover:scale-150" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Dicas <span className="text-gradient-eco">rotativas</span> do dia
          </h2>
          <p className="mt-2 text-muted-foreground">Pequenas atitudes, grandes resultados.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eco-light/30 text-eco-deep font-bold">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-white">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Impacto ambiental em <span className="text-eco-light">números reais</span>.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.value} className="rounded-2xl glass-dark p-6 text-white">
                <s.icon className="h-8 w-8 text-eco-light" />
                <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
                <p className="mt-2 text-sm text-white/85 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl glass-dark p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Trash2 className="h-10 w-10 text-eco-light shrink-0" />
            <p className="text-white/90 text-lg leading-relaxed">
              Cada brasileiro gera, em média, <strong>1,2 kg de resíduo por dia</strong>. Com coleta seletiva eficiente,
              até 65% disso pode voltar para a cadeia produtiva.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
