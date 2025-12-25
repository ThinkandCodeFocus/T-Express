import type { Metadata } from "next";
import "./css/euclid-circular-a-font.css";
import "./css/style.css";

export const metadata: Metadata = {
  title: "T-Express",
  description: "Boutique en ligne T-Express",
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

