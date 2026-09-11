import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { LEGAL } from "@/config/legal";
import { ADMIN_WHATSAPP_NUMBER } from "@/lib/whatsapp";

/** Gabarit commun des pages légales et de la FAQ. */
const LegalPage = ({
  titre,
  fil,
  intro,
  children,
}: {
  titre: string;
  fil: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <main>
    <Breadcrumb title={titre} pages={[fil]} />
    <section className="overflow-hidden py-20 bg-gray-2">
      <div className="max-w-[870px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <article className="bg-white rounded-xl shadow-1 px-4 py-8 sm:p-10 xl:p-12.5 text-dark-2 leading-relaxed">
          <p className="text-custom-sm text-dark-4 mb-6">Dernière mise à jour : {LEGAL.miseAJour}</p>
          {intro && <div className="mb-8 text-dark">{intro}</div>}
          <div className="space-y-8">{children}</div>
          <p className="mt-10 pt-6 border-t border-gray-3 text-custom-sm">
            Une question ? Écrivez-nous sur{" "}
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue hover:underline"
            >
              WhatsApp ({LEGAL.whatsappAffiche})
            </a>{" "}
            ou via la page{" "}
            <Link href="/contact" className="text-blue hover:underline">
              Contact
            </Link>
            .
          </p>
        </article>
      </div>
    </section>
  </main>
);

/** Section titrée d'une page légale. */
export const Section = ({ titre, children }: { titre: string; children: React.ReactNode }) => (
  <section>
    <h2 className="font-semibold text-dark text-lg sm:text-custom-1 mb-3">{titre}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

/** Liste à puces homogène entre les pages. */
export const Liste = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-5 space-y-1.5">{children}</ul>
);

export default LegalPage;
