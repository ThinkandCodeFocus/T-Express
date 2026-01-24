"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { paiementService } from "@/services/paiement.service";
import { usePanier } from "@/hooks/usePanier";
import toast from "react-hot-toast";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = usePanier();
  const commandeId = searchParams.get("commande_id");
  
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Vérifier le statut du paiement au montage
  useEffect(() => {
    const verifierPaiement = async () => {
      if (!commandeId) {
        setPaymentStatus('error');
        setErrorMessage('ID de commande manquant');
        setVerifying(false);
        return;
      }

      try {
        const result = await paiementService.verifierStatut(parseInt(commandeId));
        
        console.log('✅ Vérification paiement:', result);
        
        // Vérifier si le paiement est validé
        if (result.statut_paiement === 'Complété' || result.statut_paiement === 'validé') {
          setPaymentStatus('success');
          // Rafraîchir le panier (il a été vidé côté backend)
          await refresh();
          toast.success('Paiement confirmé !');
        } 
        // Paiement encore en attente
        else if (result.statut_paiement === 'en_attente' || result.statut_paiement === 'En cours') {
          setPaymentStatus('pending');
          setErrorMessage('Le paiement est en cours de traitement. Veuillez patienter...');
        } 
        // Paiement échoué
        else {
          setPaymentStatus('failed');
          setErrorMessage('Le paiement a échoué ou a été annulé.');
        }
      } catch (error: any) {
        console.error('❌ Erreur vérification paiement:', error);
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Erreur lors de la vérification du paiement');
      } finally {
        setVerifying(false);
      }
    };

    verifierPaiement();
  }, [commandeId, refresh]);

  // État de chargement
  if (verifying) {
    return (
      <>
        <Breadcrumb title={"Vérification du paiement"} pages={["paiement", "vérification"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg
                  className="w-12 h-12 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-dark mb-4">Vérification du paiement...</h2>
              <p className="text-lg text-body">
                Nous vérifions le statut de votre paiement. Veuillez patienter.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Paiement en attente
  if (paymentStatus === 'pending') {
    return (
      <>
        <Breadcrumb title={"Paiement en cours"} pages={["paiement", "en cours"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-dark mb-4">
                Paiement en cours de traitement
              </h1>
              <p className="text-lg text-body mb-8">
                {errorMessage}
                <br />
                Votre commande #{commandeId} sera confirmée dès réception du paiement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/my-account/orders"
                  className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Voir mes commandes
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center font-medium text-dark bg-gray-1 py-3 px-8 rounded-md ease-out duration-200 hover:bg-gray-2"
                >
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Paiement échoué
  if (paymentStatus === 'failed' || paymentStatus === 'error') {
    return (
      <>
        <Breadcrumb title={"Paiement échoué"} pages={["paiement", "échec"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-dark mb-4">
                Paiement échoué
              </h1>
              <p className="text-lg text-body mb-8">
                {errorMessage || 'Une erreur est survenue lors du paiement.'}
                <br />
                Votre panier a été conservé. Vous pouvez réessayer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Réessayer le paiement
                </Link>
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center font-medium text-dark bg-gray-1 py-3 px-8 rounded-md ease-out duration-200 hover:bg-gray-2"
                >
                  Retour au panier
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Paiement réussi (statut = 'success')
  return (
    <>
      <Breadcrumb title={"Paiement réussi"} pages={["paiement", "succès"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
            {/* Icône de succès */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-dark mb-4">
              Paiement effectué avec succès !
            </h1>
            
            <p className="text-lg text-body mb-8">
              Votre commande {commandeId ? `#${commandeId}` : ""} a été confirmée et le paiement a été reçu.
              <br />
              Vous recevrez un email de confirmation sous peu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/my-account/orders"
                className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Voir mes commandes
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center font-medium text-dark bg-gray-1 py-3 px-8 rounded-md ease-out duration-200 hover:bg-gray-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Retour à l&apos;accueil
              </Link>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-10 pt-8 border-t border-gray-3">
              <h2 className="text-xl font-semibold text-dark mb-4">
                Que se passe-t-il ensuite ?
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-1">Confirmation</h3>
                    <p className="text-sm text-body">
                      Vous recevrez un email de confirmation avec les détails de votre commande
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-1">Préparation</h3>
                    <p className="text-sm text-body">
                      Votre commande sera préparée et emballée avec soin
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-1">Livraison</h3>
                    <p className="text-sm text-body">
                      Nous vous livrerons à l&apos;adresse indiquée sous 2-5 jours ouvrés
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Breadcrumb title={"Chargement..."} pages={["paiement"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-3 rounded mx-auto mb-4"></div>
              </div>
            </div>
          </div>
        </section>
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
