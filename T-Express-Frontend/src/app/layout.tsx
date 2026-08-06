import type { Metadata } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";

export const metadata: Metadata = {
  title: "T-Express",
  description: "Boutique en ligne T-Express",
  openGraph: {
    title: "T-Express",
    description: "Boutique en ligne T-Express",
    url: "https://www.t-express.sn",
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
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-euclid-circular-a antialiased">
        {children}
      </body>
    </html>
  );
}

