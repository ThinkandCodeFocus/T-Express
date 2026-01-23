"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import WavePayment from "@/components/Payment/WavePayment";
import OrangeMoneyPayment from "@/components/Payment/OrangeMoneyPayment";
import toast from "react-hot-toast";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const commandeId = searchParams.get("commande_id");
  const mode = searchParams.get("mode") as "wave" | "orange_money";
  const montant = searchParams.get("montant");
  const telephone = searchParams.get("telephone");

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Vérifier que tous les paramètres sont présents
    if (!commandeId || !mode || !montant) {
      toast.error("Paramètres de paiement manquants");
      router.push("/checkout");
      return;
    }

    // Vérifier que le mode est valide
    if (mode !== "wave" && mode !== "orange_money") {
      toast.error("Mode de paiement invalide");
      router.push("/checkout");
      return;
    }

    setIsValid(true);
  }, [commandeId, mode, montant, router]);

  const handleSuccess = () => {
    toast.success("Paiement effectué avec succès !");
    router.push(`/payment-success?commande_id=${commandeId}`);
  };

  const handleCancel = () => {
    toast.error("Paiement annulé");
    router.push("/checkout");
  };

  if (!isValid) {
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

  return (
    <>
      <Breadcrumb title={"Paiement"} pages={["paiement"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[600px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-[10px] shadow-1 p-8">
            <h1 className="text-2xl font-bold text-dark mb-6 text-center">
              {mode === "wave" ? "Paiement Wave" : "Paiement Orange Money"}
            </h1>

            {mode === "wave" && (
              <WavePayment
                commandeId={parseInt(commandeId!)}
                montant={parseFloat(montant!)}
                telephone={telephone || ''}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}

            {mode === "orange_money" && (
              <OrangeMoneyPayment
                commandeId={parseInt(commandeId!)}
                montant={parseFloat(montant!)}
                telephone={telephone || ''}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
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
    }>
      <PaymentContent />
    </Suspense>
  );
}
