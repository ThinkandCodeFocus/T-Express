"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import { usePanierContext } from "@/context/PanierContext";
import { useAuthContext } from "@/context/AuthContext";
import { adresseService } from "@/services/adresse.service";
import { commandeService } from "@/services/commande.service";
import { panierService } from "@/services/panier.service";
import { useRouter } from "next/navigation";
import type { Adresse } from "@/types/api.types";
import PhoneInput from "@/components/Common/PhoneInput";
import { validatePhone } from "@/lib/utils";
import { lienWhatsAppAdmin, messageCommandeWhatsApp } from "@/lib/whatsapp";
import toast from "react-hot-toast";

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type Confirmation = { commandeId: number; lienWhatsApp: string };
const CLE_CONFIRMATION = "t-express:derniere-commande";

const CheckoutNew = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  // Contexte partagé (et non usePanier) : vider le panier après la commande
  // doit aussi remettre à zéro le compteur du header.
  const { panier, loading: panierLoading, refresh: rafraichirPanier } = usePanierContext();
  
  // States pour les adresses
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [selectedAdresseId, setSelectedAdresseId] = useState<number | null>(null);
  const [loadingAdresses, setLoadingAdresses] = useState(true);
  
  // States pour la nouvelle adresse
  const [showNewAddress, setShowNewAddress] = useState(true); // Toujours afficher le formulaire
  const [newAddress, setNewAddress] = useState({
    nom_complet: "",
    adresse_ligne_1: "",
    adresse_ligne_2: "",
    ville: "",
    code_postal: "00000", // Valeur par défaut car non utilisé
    pays: "Sénégal",
    telephone: "",
    type: "Livraison" as "Facturation" | "Livraison" | "Principale"  // Backend attend "Livraison" avec majuscule
  });
  
  // States pour la commande
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  // Renseigné une fois la commande créée : affiche l'écran de finalisation.
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // Sur mobile, basculer vers WhatsApp décharge souvent l'onglet : au retour,
  // sans cette reprise, le client verrait "panier vide" et perdrait le lien.
  // Seulement si le panier est vide, pour ne jamais masquer un nouveau checkout.
  useEffect(() => {
    if (panierLoading || confirmation) return;
    try {
      const sauvegarde = sessionStorage.getItem(CLE_CONFIRMATION);
      if (!sauvegarde) return;
      if (panier && panier.lignes.length > 0) {
        sessionStorage.removeItem(CLE_CONFIRMATION);
        return;
      }
      setConfirmation(JSON.parse(sauvegarde));
    } catch {
      // Stockage indisponible (navigation privée...) : pas de reprise.
    }
  }, [panierLoading, panier, confirmation]);

  // Format FCFA
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Charger les adresses du client
  useEffect(() => {
    const loadAdresses = async () => {
      if (!user) {
        setLoadingAdresses(false);
        return;
      }

      try {
        const data = await adresseService.getListe();
        setAdresses(data);
        
        // Sélectionner la première adresse par défaut
        if (data.length > 0) {
          setSelectedAdresseId(data[0].id);
        } else {
          setShowNewAddress(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des adresses:", error);
      } finally {
        setLoadingAdresses(false);
      }
    };

    loadAdresses();
  }, [user]);

  // La livraison est gratuite. Ne pas remettre de frais ici sans les avoir
  // d'abord implementes cote backend : la table `commandes` n'a aucune
  // colonne `frais_livraison`, sa validation (Commande/CreateRequest) ne lit
  // pas ce champ, et `montant_total` y est recalcule a partir des seuls
  // produits. Afficher des frais ici annoncerait donc au client un total
  // superieur a celui reellement enregistre en base. Ticket #4.
  const shippingCost = 0;
  const totalWithShipping = (panier?.total || 0) + shippingCost;

  // Soumettre la commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez être connecté pour passer commande");
      router.push("/signin");
      return;
    }

    if (!selectedAdresseId && !showNewAddress) {
      toast.error("Veuillez sélectionner une adresse de livraison");
      return;
    }

    if (!panier || panier.lignes.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    try {
      setProcessing(true);

      // Créer une nouvelle adresse si nécessaire
      let adresseId = selectedAdresseId;
      if (showNewAddress && newAddress.adresse_ligne_1) {
        // Le backend exige desormais le telephone sur une adresse (utilise pour le
        // suivi WhatsApp de la commande) : le verifier ici evite un aller-retour API
        // qui echouerait avec 422 pour un champ que le formulaire laissait optionnel.
        if (!newAddress.telephone) {
          toast.error("Le numéro de téléphone est obligatoire pour la livraison");
          setProcessing(false);
          return;
        }
        if (!validatePhone(newAddress.telephone)) {
          toast.error("Le numéro de téléphone n'est pas valide. Format attendu : +221 XX XXX XX XX");
          setProcessing(false);
          return;
        }

        try {
          const nouvelleAdresse = await adresseService.ajouter(newAddress);
          adresseId = nouvelleAdresse.id;
        } catch (adresseError: any) {
          console.error("Erreur création adresse:", adresseError.message);
          toast.error("Erreur lors de la création de l'adresse: " + (adresseError.message || "Erreur inconnue"));
          setProcessing(false);
          return;
        }
      }

      if (!adresseId) {
        toast.error("Veuillez fournir une adresse de livraison");
        setProcessing(false);
        return;
      }

      const commande = await commandeService.creer({
        adresse_livraison_id: adresseId,
        adresse_facturation_id: adresseId,
      });

      // Plus de paiement en ligne (l'accès à l'API Wave a été retiré) : la
      // commande est finalisée par l'admin, à qui le client envoie le
      // récapitulatif sur WhatsApp. Le backend ne stocke pas les notes, elles
      // passent donc par ce message.
      const adresseUtilisee =
        showNewAddress && newAddress.adresse_ligne_1
          ? newAddress
          : adresses.find((a) => a.id === adresseId);
      const message = messageCommandeWhatsApp({
        commandeId: commande.id,
        client: {
          nom: adresseUtilisee?.nom_complet || `${user.prenom} ${user.nom}`,
          telephone: adresseUtilisee?.telephone || user.telephone || "",
          adresse: [adresseUtilisee?.adresse_ligne_1, adresseUtilisee?.adresse_ligne_2, adresseUtilisee?.ville]
            .filter(Boolean)
            .join(", "),
        },
        lignes: panier.lignes.map((ligne) => ({
          nom: ligne.produit?.nom ?? `Produit #${ligne.produit_id}`,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prix_unitaire,
          lien: `${window.location.origin}/shop-details?id=${ligne.produit_id}`,
        })),
        fraisLivraison: shippingCost,
        total: totalWithShipping,
        notes: notes.trim() || undefined,
      });

      // Le backend ne vide le panier qu'après un paiement Wave réussi, qui
      // n'arrive plus : sans ça, les articles commandés y resteraient.
      try {
        await panierService.vider();
        await rafraichirPanier();
      } catch (viderError) {
        console.warn("Commande créée mais panier non vidé :", viderError);
      }

      const nouvelleConfirmation = { commandeId: commande.id, lienWhatsApp: lienWhatsAppAdmin(message) };
      try {
        sessionStorage.setItem(CLE_CONFIRMATION, JSON.stringify(nouvelleConfirmation));
      } catch {
        // Stockage indisponible : l'écran s'affiche quand même, sans reprise.
      }
      setConfirmation(nouvelleConfirmation);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Erreur lors de la création de la commande:", error.message);
      toast.error(error.message || "Erreur lors de la création de la commande");
    } finally {
      setProcessing(false);
    }
  };

  // Commande créée : à tester avant "panier vide", le panier vient d'être vidé.
  if (confirmation) {
    return (
      <>
        <Breadcrumb title={"Commande enregistrée"} pages={["commande"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 px-4 py-10 sm:p-12.5 text-center max-w-[640px] mx-auto">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-light-6 text-green flex items-center justify-center">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-dark mb-3">
                Commande #{confirmation.commandeId} enregistrée
              </h2>
              <p className="text-dark-4 mb-2">
                Dernière étape : envoyez-nous le récapitulatif de votre commande sur WhatsApp.
              </p>
              <p className="text-dark-4 mb-8">
                Notre équipe vous répondra sur WhatsApp pour confirmer la commande et convenir avec vous
                du paiement et de la livraison.
              </p>

              <a
                href={confirmation.lienWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto font-medium text-white bg-[#25D366] py-3.5 px-8 rounded-md ease-out duration-200 hover:bg-[#1ebe5b]"
              >
                <WhatsAppIcon />
                Envoyer ma commande sur WhatsApp
              </a>

              <p className="text-custom-sm text-dark-5 mt-4">
                Le message est déjà rempli (produits, adresse, total) : il vous suffit de l&apos;envoyer.
              </p>

              <div className="mt-8 pt-6 border-t border-gray-3">
                <Link href="/my-account/orders" className="text-blue hover:underline">
                  Voir mes commandes
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Loading state
  if (panierLoading || loadingAdresses) {
    return (
      <>
        <Breadcrumb title={"Paiement"} pages={["paiement"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-3 rounded mx-auto mb-4"></div>
                <div className="h-6 w-64 bg-gray-3 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <>
        <Breadcrumb title={"Paiement"} pages={["paiement"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Connexion requise</h2>
              <p className="text-lg mb-6">Vous devez être connecté pour accéder au paiement</p>
              <a 
                href="/signin" 
                className="inline-flex text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Se connecter
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Check if cart is empty
  if (!panier || panier.lignes.length === 0) {
    return (
      <>
        <Breadcrumb title={"Paiement"} pages={["paiement"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Panier vide</h2>
              <p className="text-lg mb-6">Votre panier est vide. Ajoutez des produits avant de procéder au paiement.</p>
              <a 
                href="/shop" 
                className="inline-flex text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Continuer mes achats
              </a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Paiement"} pages={["paiement"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Checkout left */}
              <div className="lg:max-w-[670px] w-full">
                {/* Adresse de livraison */}
                <div className="mt-0">
                  <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
                    Adresse de livraison
                  </h2>

                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                        <div className="mb-5">
                          <label htmlFor="nom_complet" className="block mb-2.5">
                            Nom complet <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            id="nom_complet"
                            value={newAddress.nom_complet}
                            onChange={(e) => setNewAddress({...newAddress, nom_complet: e.target.value})}
                            placeholder="Prénom et nom"
                            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            required
                          />
                        </div>

                        <div className="mb-5">
                          <label htmlFor="ligne1" className="block mb-2.5">
                            Adresse <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            id="ligne1"
                            value={newAddress.adresse_ligne_1}
                            onChange={(e) => setNewAddress({...newAddress, adresse_ligne_1: e.target.value})}
                            placeholder="Numéro et nom de rue"
                            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            required
                          />
                        </div>

                        <div className="mb-5">
                          <label htmlFor="ligne2" className="block mb-2.5">
                            Complément d&apos;adresse
                          </label>
                          <input
                            type="text"
                            id="ligne2"
                            value={newAddress.adresse_ligne_2}
                            onChange={(e) => setNewAddress({...newAddress, adresse_ligne_2: e.target.value})}
                            placeholder="Appartement, étage, etc."
                            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          />
                        </div>

                        <div className="mb-5">
                          <label htmlFor="ville" className="block mb-2.5">
                            Ville <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            id="ville"
                            value={newAddress.ville}
                            onChange={(e) => setNewAddress({...newAddress, ville: e.target.value})}
                            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            required
                          />
                        </div>

                        <div className="mb-5">
                          <PhoneInput
                            id="telephone"
                            value={newAddress.telephone}
                            onChange={(value) => setNewAddress({...newAddress, telephone: value})}
                            placeholder="+221 XX XXX XX XX"
                            required
                            label="Téléphone"
                          />
                        </div>
                  </div>
                </div>

                {/* Notes de commande */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Notes de commande (optionnel)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      placeholder="Instructions spéciales pour la livraison..."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Checkout right */}
              <div className="max-w-[455px] w-full">
                {/* Résumé de commande */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Votre Commande
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Produit</h4>
                      <h4 className="font-medium text-dark text-right">Sous-total</h4>
                    </div>

                    {panier.lignes.map((ligne) => (
                      <div key={ligne.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <p className="text-dark">
                          {ligne.produit.nom} × {ligne.quantite}
                        </p>
                        <p className="text-dark text-right">
                          {formatPrice(ligne.prix_unitaire * ligne.quantite)}
                        </p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Frais de livraison</p>
                      <p className="text-green-600 font-semibold text-right">Gratuite ✓</p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">
                        {formatPrice(totalWithShipping)}
                      </p>
                    </div>
                  </div>
                </div>

               {/* Méthode de livraison */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Méthode de livraison</h3>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    <div className="flex flex-col gap-3">
                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === "standard"}
                          onChange={(e) => setShippingMethod(e.target.value as "standard")}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 rounded-md border py-3.5 px-5 border-gray-4">
                          <p className="text-dark font-medium">🚚 Livraison Standard - <span className="font-bold">Gratuite</span> (3-5 jours)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Finalisation */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Paiement</h3>
                  </div>

                  <div className="p-4 sm:p-8.5 flex gap-4">
                    <WhatsAppIcon className="flex-shrink-0 text-[#25D366] mt-0.5" />
                    <p className="text-dark-4 text-custom-sm">
                      Après validation, vous enverrez le récapitulatif de votre commande à notre équipe sur
                      WhatsApp. Elle vous confirmera la commande et conviendra avec vous du paiement et de la
                      livraison.
                    </p>
                  </div>
                </div>

                {/* Bouton de commande */}
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? "Traitement en cours..." : "Valider la commande"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutNew;