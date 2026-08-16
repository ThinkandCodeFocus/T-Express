import type { Metadata, Viewport } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import ToastProvider from "@/components/Common/ToastProvider";

export const metadata: Metadata = {
  title: "T-Express",
  description: "Boutique en ligne T-Express",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3C50E0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-euclid-circular-a antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}