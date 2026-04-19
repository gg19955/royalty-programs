import { Nav } from "@/components/nav";
import { Reveal } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { EnquireForm } from "./enquire-form";

export const dynamic = "force-dynamic";

export default function EnquirePage() {
  return (
    <>
      <ScrollProgress />
      <Nav />

      <section className="relative overflow-hidden border-b border-brand-line bg-black">
        <div className="mx-auto max-w-[1296px] px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <div className="section-index">/ Enquire</div>
          </Reveal>
          <Reveal as="up" delay={120}>
            <h1 className="mt-10 max-w-5xl font-display text-6xl font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-8xl md:text-[8rem]">
              Start the
              <br />
              conversation.
            </h1>
          </Reveal>
          <Reveal as="up" delay={260}>
            <div className="mt-16 grid gap-12 border-t border-brand-line pt-12 sm:grid-cols-[1fr_2fr] sm:gap-20">
              <div className="section-index">/ Two paths</div>
              <p className="max-w-2xl text-base leading-[1.7] text-white/80 sm:text-lg">
                Whether you&apos;re planning a stay with Lively or considering
                a home for the portfolio - leave the details below and the
                right person on our team will be in touch.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
          <Reveal as="up">
            <EnquireForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}

export const metadata = {
  title: "Enquire - Lively",
  description:
    "Speak to Lively about a stay, or introduce a property to the portfolio.",
};
