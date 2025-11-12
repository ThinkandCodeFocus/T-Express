"use client";
import React, { useState } from "react";

const Discount = () => {
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setMessage("Veuillez entrer un code promo");
      return;
    }

    try {
      setApplying(true);
      setMessage("");
      
      // TODO: Implémenter l'API de vérification de code promo
      // Pour l'instant, simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérification basique (à remplacer par l'API)
      if (couponCode.toUpperCase() === "PROMO10") {
        setMessage("Code promo appliqué avec succès! -10%");
      } else {
        setMessage("Code promo invalide");
      }
    } catch (error) {
      setMessage("Erreur lors de l'application du code promo");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApplyCoupon}>
        {/* <!-- coupon box --> */}
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="">Avez-vous un code promo?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Entrer le code promo"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                disabled={applying}
                className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
              >
                {applying ? "Application..." : "Appliquer"}
              </button>
            </div>

            {message && (
              <p className={`mt-4 text-sm ${message.includes("succès") ? "text-green-600" : "text-red"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
