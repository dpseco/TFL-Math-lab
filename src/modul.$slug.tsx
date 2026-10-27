import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { MODULES } from "@/lib/modules";
import GoldenLab from "@/components/labs/GoldenLab";
import CollatzLab from "@/components/labs/CollatzLab";
import PiLab from "@/components/labs/PiLab";
import PythagorasLab from "@/components/labs/PythagorasLab";
import LogisticLab from "@/components/labs/LogisticLab";
import PascalLab from "@/components/labs/PascalLab";
import LorenzLab from "@/components/labs/LorenzLab";
import EulerLab from "@/components/labs/EulerLab";

const LABS: Record<string, ComponentType> = {
  "altin-oran": GoldenLab, collatz: CollatzLab, pi: PiLab, "pisagor-akordu": PythagorasLab,
  "lojistik-harita": LogisticLab, "pascal-sierpinski": PascalLab, lorenz: LorenzLab, euler: EulerLab,
};

export const Route = createFileRoute("/modul/$slug")({
  loader: ({ params }) => {
    const meta = MODULES.find((m) => m.slug === params.slug);
    if (!meta) throw notFound();
    return { meta };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.meta.title} — TFL Math Lab` : "Modül bulunamadı — TFL Math Lab";
    const description = loaderData ? `${loaderData.meta.short}. Etkileşimli simülasyon, kullanım kılavuzu ve matematiksel kanıt.` : "Aradığınız modül bulunamadı.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ModulePage,
});

function ModulePage() {
  const { meta } = Route.useLoaderData();
  const Lab = LABS[meta.slug] ?? GoldenLab;
  return <Lab key={meta.slug} />;
}
