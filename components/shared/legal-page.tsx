import { Reveal } from "@/components/motion/reveal";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <>
      <section className="pt-32 pb-12">
        <div className="container-xl max-w-3xl">
          <Reveal variant="fadeUp">
            <div className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-4">Legal</div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-black mb-4">{title}</h1>
            <p className="text-sm text-black/30">Last updated: {lastUpdated}</p>
          </Reveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-xl max-w-3xl">
          <Reveal variant="fadeUp">
            <p className="text-black/60 leading-relaxed mb-10 text-lg">{intro}</p>
          </Reveal>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <Reveal key={i} variant="fadeUp" delay={i * 0.04}>
                <div className="border-t border-black/[0.06] pt-8">
                  <h2 className="font-display text-xl font-bold text-black mb-4">
                    <span className="text-black/20 mr-3">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  <p className="text-black/55 leading-relaxed">{s.content}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fadeUp" className="mt-16 p-6 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-700">
              Questions about this policy?{" "}
              <a href="/contact" className="font-semibold underline">Contact our legal team</a> at{" "}
              <a href="mailto:legal@simkuu.com" className="font-semibold underline">legal@simkuu.com</a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
