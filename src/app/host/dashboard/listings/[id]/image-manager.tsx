"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteListingImage,
  setHeroImage,
  uploadListingImage,
} from "../actions";

type Image = {
  id: string;
  url: string;
  is_hero: boolean;
  sort_order: number;
};

export function ImageManager({
  propertyId,
  images,
}: {
  propertyId: string;
  images: Image[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const form = new FormData();
    form.append("file", file);
    startTransition(async () => {
      const res = await uploadListingImage(propertyId, form);
      if (!res.ok) setError(res.error);
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function remove(imageId: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteListingImage(propertyId, imageId);
      if (!res.ok) setError(res.error);
    });
  }

  function makeHero(imageId: string) {
    setError(null);
    startTransition(async () => {
      const res = await setHeroImage(propertyId, imageId);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-line bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-700">
            {images.length === 0
              ? "No photos yet. Add at least one to publish."
              : `${images.length} photo${images.length === 1 ? "" : "s"} · first image marked hero is the cover.`}
          </div>
          {error ? (
            <div className="mt-1 text-xs text-red-700">{error}</div>
          ) : null}
        </div>
        <label className="cursor-pointer rounded-sm bg-brand px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white hover:bg-black">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={isPending}
          />
          {isPending ? "Uploading…" : "Upload photo"}
        </label>
      </div>

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <li
              key={img.id}
              className="group relative overflow-hidden rounded-sm border border-brand-line bg-brand-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              {img.is_hero ? (
                <div className="absolute left-2 top-2 rounded-sm bg-brand px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white">
                  Hero
                </div>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {!img.is_hero ? (
                  <button
                    type="button"
                    onClick={() => makeHero(img.id)}
                    disabled={isPending}
                    className="rounded-sm bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-brand hover:bg-white disabled:opacity-50"
                  >
                    Set hero
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  disabled={isPending}
                  className="rounded-sm bg-red-600 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
