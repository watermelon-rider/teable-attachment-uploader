import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n-context";

export const metadata: Metadata = {
  title: "TeaUploader - Teable Bulk Upload Tool",
  description: "Bulk attachment upload and Excel import tool for Teable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
