"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { usePanier } from "@/hooks/usePanier";
import { useAuthContext } from "@/context/AuthContext";
import { adresseService } from "@/services/adresse.service";
import { commandeService } from "@/services/commande.service";
import { useRouter } from "next/navigation";
import type { Adresse } from "@/types/api.types";
import Image from "next/image";

const CheckoutNew = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { panier, loading: panierLoading } = usePanier();
  
  // States pour les adresses
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [selectedAdresseId, setSelectedAdresseId] = useState<number | null>(null);
  const [loadingAdresses, setLoadingAdresses] = useState(true);
  
  // States pour la nouvelle adresse
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    nom_complet: "",
    adresse_ligne_1: "",
    adresse_ligne_2: "",
    ville: "",
    code_postal: "",
    pays: "Sénégal",
    telephone: "",
    type: "livraison" as "facturation" | "livraison"
  });
  
  // States pour la commande
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "especes">("wave");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

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

  // Calculer les frais de livraison
  const shippingCost = shippingMethod === "express" ? 3000 : 1500;
  const totalWithShipping = (panier?.total || 0) + shippingCost;

  // Soumettre la commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Vous devez être connecté pour passer commande");
      router.push("/signin");
      return;
    }

    if (!selectedAdresseId && !showNewAddress) {
      alert("Veuillez sélectionner une adresse de livraison");
      return;
    }

    if (!panier || panier.lignes.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    try {
      setProcessing(true);

      // Créer une nouvelle adresse si nécessaire
      let adresseId = selectedAdresseId;
      if (showNewAddress && newAddress.adresse_ligne_1) {
        const nouvelleAdresse = await adresseService.ajouter(newAddress);
        adresseId = nouvelleAdresse.id;
      }

      if (!adresseId) {
        alert("Veuillez fournir une adresse de livraison");
        return;
      }

      // Créer la commande
      const commandeData = {
        adresse_livraison_id: adresseId,
        adresse_facturation_id: adresseId, // Utiliser la même adresse par défaut
        mode_paiement: (paymentMethod === "especes" ? "cash" : paymentMethod) as "wave" | "orange_money" | "cash" | "carte",
        notes: notes || undefined,
        frais_livraison: shippingMethod === "express" ? 5000 : 2000 // Frais de livraison en FCFA
      };

      const commande = await commandeService.creer(commandeData);
      
      alert(`Commande ${commande.numero_commande} créée avec succès !`);
      router.push(`/my-account/orders`);
    } catch (error: any) {
      console.error("Erreur lors de la création de la commande:", error);
      alert(error.message || "Erreur lors de la création de la commande");
    } finally {
      setProcessing(false);
    }
  };

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
                    {adresses.length > 0 && !showNewAddress && (
                      <div className="mb-5">
                        <label className="block mb-2.5">Sélectionnez une adresse</label>
                        <select
                          value={selectedAdresseId || ""}
                          onChange={(e) => setSelectedAdresseId(Number(e.target.value))}
                          className="w-full bg-gray-1 rounded-md border border-gray-3 py-3 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                          required
                        >
                          <option value="">-- Choisir une adresse --</option>
                          {adresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.adresse_ligne_1}, {addr.ville} - {addr.code_postal}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewAddress(true)}
                          className="mt-3 text-blue hover:text-blue-dark"
                        >
                          + Ajouter une nouvelle adresse
                        </button>
                      </div>
                    )}

                    {(showNewAddress || adresses.length === 0) && (
                      <>
                        {adresses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowNewAddress(false)}
                            className="mb-4 text-blue hover:text-blue-dark"
                          >
                            ← Utiliser une adresse existante
                          </button>
                        )}
                        
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
                            required={showNewAddress}
                          />
                        </div>

                        <div className="mb-5">
                          <label htmlFor="ligne2" className="block mb-2.5">
                            Complément d'adresse
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

                        <div className="flex flex-col sm:flex-row gap-5 mb-5">
                          <div className="w-full">
                            <label htmlFor="ville" className="block mb-2.5">
                              Ville <span className="text-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="ville"
                              value={newAddress.ville}
                              onChange={(e) => setNewAddress({...newAddress, ville: e.target.value})}
                              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                              required={showNewAddress}
                            />
                          </div>

                          <div className="w-full">
                            <label htmlFor="code_postal" className="block mb-2.5">
                              Code postal <span className="text-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="code_postal"
                              value={newAddress.code_postal}
                              onChange={(e) => setNewAddress({...newAddress, code_postal: e.target.value})}
                              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                              required={showNewAddress}
                            />
                          </div>
                        </div>

                        <div className="mb-5">
                          <label htmlFor="telephone" className="block mb-2.5">
                            Téléphone <span className="text-red">*</span>
                          </label>
                          <input
                            type="tel"
                            id="telephone"
                            value={newAddress.telephone}
                            onChange={(e) => setNewAddress({...newAddress, telephone: e.target.value})}
                            placeholder="+221 XX XXX XX XX"
                            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                            required={showNewAddress}
                          />
                        </div>
                      </>
                    )}
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
                      <p className="text-dark text-right">{formatPrice(shippingCost)}</p>
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
                          <p>Livraison Standard - {formatPrice(1500)} (3-5 jours)</p>
                        </div>
                      </label>

                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === "express"}
                          onChange={(e) => setShippingMethod(e.target.value as "express")}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 rounded-md border py-3.5 px-5 border-gray-4">
                          <p>Livraison Express - {formatPrice(3000)} (1-2 jours)</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Méthode de paiement */}
                <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Méthode de paiement</h3>
                  </div>

                  <div className="p-4 sm:p-8.5">
                    <div className="flex flex-col gap-3">
                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          name="payment"
                          value="wave"
                          checked={paymentMethod === "wave"}
                          onChange={(e) => setPaymentMethod(e.target.value as "wave")}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 rounded-md border py-3.5 px-5 border-gray-4">
                          <p>Wave</p>
                        </div>
                      </label>

                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          name="payment"
                          value="orange_money"
                          checked={paymentMethod === "orange_money"}
                          onChange={(e) => setPaymentMethod(e.target.value as "orange_money")}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 rounded-md border py-3.5 px-5 border-gray-4">
                          <p>Orange Money</p>
                        </div>
                      </label>

                      <label className="flex cursor-pointer items-center gap-4">
                        <input
                          type="radio"
                          name="payment"
                          value="especes"
                          checked={paymentMethod === "especes"}
                          onChange={(e) => setPaymentMethod(e.target.value as "especes")}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 rounded-md border py-3.5 px-5 border-gray-4">
                          <p>Paiement à la livraison (Espèces)</p>
                        </div>
                      </label>
                    </div>
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
                  {processing ? "Traitement en cours..." : "Confirmer la commande"}
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
