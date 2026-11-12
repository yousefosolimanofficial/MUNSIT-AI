import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "MUNSIT AI",
};

// Arabic / RTL is the product default (Frontend Handoff). Locale routing and
// LTR switching arrive with the i18n foundation in Phase 02.
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
