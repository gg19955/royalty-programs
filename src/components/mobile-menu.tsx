"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignOutButton } from "./sign-out-button";

type Props = {
  signedIn: boolean;
  isAdmin: boolean;
};

/**
 * Hamburger trigger + full-screen black drawer for mobile. Desktop nav
 * keeps its inline-link layout (this component is hidden at sm+). On
 * open we lock body scroll so the drawer reads like a modal surface.
 */
export function MobileMenu({ signedIn, isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkCls =
    "block font-display text-[11px] font-medium uppercase tracking-[0.28em] text-white/70 transition hover:text-white";
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="relative z-40 -mr-2 inline-flex h-11 w-11 items-center justify-center text-white md:hidden"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 8h18" />
          <path d="M4 13h18" />
          <path d="M4 18h18" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black text-white md:hidden"
        >
          <div className="flex items-center justify-between border-b border-brand-line px-6 py-5">
            <Link
              href="/"
              onClick={close}
              className="font-display text-2xl font-semibold uppercase tracking-[0.18em]"
            >
              Lively
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                aria-hidden
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M5 5l12 12" />
                <path d="M17 5L5 17" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-10">
            <div className="section-index text-white/50">/ Browse</div>
            <ul className="mt-6 space-y-6">
              <li>
                <Link href="/" onClick={close} className={linkCls}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stays" onClick={close} className={linkCls}>
                  Stays
                </Link>
              </li>
              <li>
                <Link href="/collection" onClick={close} className={linkCls}>
                  The Collection
                </Link>
              </li>
              <li>
                <Link href="/experiences" onClick={close} className={linkCls}>
                  Experiences
                </Link>
              </li>
            </ul>

            <div className="mt-12 section-index text-white/50">/ About</div>
            <ul className="mt-6 space-y-6">
              <li>
                <Link href="/about" onClick={close} className={linkCls}>
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/about/team" onClick={close} className={linkCls}>
                  Our team
                </Link>
              </li>
              <li>
                <Link href="/faq" onClick={close} className={linkCls}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/host" onClick={close} className={linkCls}>
                  List property
                </Link>
              </li>
            </ul>

            {signedIn && (
              <>
                <div className="mt-12 section-index text-white/50">/ Account</div>
                <ul className="mt-6 space-y-6">
                  <li>
                    <Link href="/portal" onClick={close} className={linkCls}>
                      Portal
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href="/admin" onClick={close} className={linkCls}>
                        Admin
                      </Link>
                    </li>
                  )}
                  <li onClick={close}>
                    <SignOutButton />
                  </li>
                </ul>
              </>
            )}
          </nav>

          {!signedIn && (
            <div className="border-t border-brand-line p-6">
              <Link
                href="/enquire"
                onClick={close}
                className="block rounded-[15px] bg-white px-6 py-4 text-center font-display text-[11px] font-medium uppercase tracking-[0.28em] text-black transition hover:bg-brand-accent"
              >
                Enquire
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
