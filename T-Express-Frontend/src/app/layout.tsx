import type { Metadata, Viewport } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";
import ToastProvider from "@/components/Common/ToastProvider";

export const metadata: Metadata = {
  // Sans metadataBase, Next.js ne peut pas resoudre les URLs relatives des
  // images OG/Twitter en URLs absolues : les crawlers WhatsApp/Facebook/Twitter
  // recoivent alors un chemin qu'ils ne peuvent pas recuperer, et l'aperçu de
  // lien echoue silencieusement. Domaine reel du site (voir config/cors.php
  // cote backend) : t-express.shop, pas t-express.sn qui etait utilise ici.
  metadataBase: new URL("https://t-express.shop"),
  title: "T-Express",
  description: "Boutique en ligne T-Express",
  openGraph: {
    title: "T-Express",
    description: "Boutique en ligne T-Express",
    url: "https://t-express.shop",
    siteName: "T-Express",
    images: [
      {
        url: "/images/logo/logo.png",
        width: 800,
        height: 600,
        alt: "T-Express",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T-Express",
    description: "Boutique en ligne T-Express",
    images: ["/images/logo/logo.png"],
  },
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