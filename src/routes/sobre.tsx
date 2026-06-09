import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  Eye,
  Flower2,
  Globe2,
  Leaf,
  Lightbulb,
  Map as MapIcon,
  Server,
  Sprout,
  Target,
  TreePine,
  Users,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Siga Verde" },
      {
        name: "description",
        content:
          "A Siga Verde aproxima a população da gestão sustentável dos resíduos urbanos com tecnologia e transparência.",
      },
      { property: "og:title", content: "Sobre a Siga Verde" },
      {
        property: "og:description",
        content:
          "Tecnologia para cidades mais limpas, transparentes e sustentáveis.",
      },
    ],
  }),
  component: Sobre,
});

const diffs = [
  { icon: Eye, title: "Rastreamento em tempo real", desc: "GPS contínuo dos caminhões da coleta." },
  { icon: CheckCircle2, title: "Transparência pública", desc: "Dados abertos para cidadãos e gestores." },
  { icon: Leaf, title: "Educação ambiental", desc: "Conteúdos integrados de sustentabilidade." },
  { icon: Building2, title: "Cidades inteligentes", desc: "Arquitetura pronta para integrar com sistemas municipais." },
  { icon: BarChart3, title: "Dados e indicadores", desc: "Métricas de eficiência, cobertura e impacto." },
  { icon: Globe2, title: "Sustentabilidade", desc: "Plataforma alinhada aos ODS da ONU." },
];

const stack = [
  { icon: Code2, group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "ShadCN UI"] },
  { icon: MapIcon, group: "Mapas", items: ["Mapbox", "OpenStreetMap"] },
  { icon: Server, group: "Backend", items: ["Supabase", "Edge Functions"] },
  { icon: Database, group: "Dados", items: ["PostgreSQL", "Supabase Realtime"] },
];

const targets = [
  "Prefeituras",
  "Secretarias de Meio Ambiente",
  "Investidores",
  "Programas de Inovação",
  "Hackathons",
  "Licitações Públicas",
];

const team = [
  {
    name: "Luna Felipe",
    role: "CEO & Estratégia",
    desc: "Lidera a visão da Siga Verde, conectando inovação tecnológica à gestão pública sustentável.",
    photo: "/equipe/luna.jpg",
  },
  {
    name: "Bárbara Luiza",
    role: "Desenvolvimento & Tecnologia",
    desc: "Arquiteta as soluções digitais da plataforma, garantindo escalabilidade e performance.",
    photo: "/equipe/barbara.jpg",
  },
  {
    name: "Flávia Alves",
    role: "Design & Sustentabilidade",
    desc: "Une experiência do usuário e compromisso ambiental em cada detalhe da interface.",
    photo: "/equipe/flavia.jpg",
  },
  {
    name: "Levy Magalhães",
    role: "Pesquisa & Inovação",
    desc: "Conduz pesquisas e valida novas tecnologias para manter a plataforma na vanguarda.",
    photo: "/equipe/levy.jpg",
  },
  {
    name: "Ana Luiza Gomes",
    role: "Sustentabilidade & Comunidade",
    desc: "Fortalece parcerias e engaja comunidades nas práticas de gestão sustentável.",
    photo: "/equipe/ana.jpg",
  },
];

function Sobre() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-soft py-20 lg:py-28">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-eco-light/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-smart-blue/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Tecnologia que aproxima a cidade da{" "}
            <span className="text-gradient-eco">sustentabilidade</span>.
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div
              key={member.name}
              className="group relative rounded-3xl border border-border/60 bg-white/70 backdrop-blur-xl p-8 shadow-soft transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.02]"
            >
              <img
                src={member.photo}
                alt={member.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/50 transition-transform duration-500 group-hover:scale-110"
              />

              <h3 className="mt-5 font-bold text-xl">{member.name}</h3>

              <span className="text-sm text-green-700 font-semibold">
                {member.role}
              </span>

              <p className="mt-3 text-sm text-gray-600">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 text-center">
        <Link
          to="/mapa"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-eco px-6 py-3 text-white"
        >
          Ver demonstração <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}