"use client";

import "./globals.css";

import { Button } from "@/shared/ui/Button";

/*
 * Last-resort boundary (Phase 04, plan §6): replaces the root layout when the locale layout itself
 * fails, so it renders its own <html>/<body> and cannot rely on the locale or next-intl. Short
 * static Arabic and English text (PROPOSED, D-R9). Next.js 16.4: `retry` re-renders the segment;
 * `metadata` is not supported here, so the title uses React's <title>.
 */

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="grid min-h-dvh place-items-center bg-surface-void-black p-lg text-text-primary">
        <title>MUNSIT AI</title>
        <main className="grid max-w-[560px] gap-sm text-center">
          <div role="alert" className="grid gap-sm">
            <h1 className="text-dashboard-title-l">حدث خطأ غير متوقع</h1>
            <p lang="en" dir="ltr" className="text-dashboard-body text-text-secondary">
              Something went wrong.
            </p>
          </div>
          <Button type="button" className="justify-self-center" onClick={() => retry()}>
            إعادة المحاولة · <span lang="en">Try again</span>
          </Button>
        </main>
      </body>
    </html>
  );
}
