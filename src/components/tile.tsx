import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  external?: boolean;
  className?: string;
};

export function Tile({ href, eyebrow, title, description, external, className }: Props) {
  const inner = (
    <>
      <div className="text-xs uppercase tracking-[0.18em] text-brand-accent">{eyebrow}</div>
      <h3 className="mt-4 font-serif text-2xl font-normal tracking-tight text-brand">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand">
        {external ? "Visit site" : "Continue"}
        <span aria-hidden>→</span>
      </div>
    </>
  );

  const baseClass = cn(
    "group flex h-full flex-col justify-between rounded-sm border border-brand-line bg-white p-8 transition hover:border-brand-accent",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={baseClass}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      {inner}
    </Link>
  );
}
