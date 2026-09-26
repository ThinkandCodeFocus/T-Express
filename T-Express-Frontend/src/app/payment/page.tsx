import { redirect } from "next/navigation";

/**
 * Le paiement en ligne a été retiré : l'accès à l'API Wave n'est plus actif et
 * les commandes se finalisent sur WhatsApp avec l'admin.
 *
 * Cette route existait pour lancer le paiement Wave. Elle est conservée, en
 * simple redirection, pour que les liens et favoris déjà en circulation
 * n'aboutissent pas sur une page morte annonçant un paiement impossible.
 */
export default function PaymentPage() {
  redirect("/checkout");
}
