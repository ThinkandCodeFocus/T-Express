"use client";
import React from "react";
import { usePanierContext } from "@/context/PanierContext";
import Link from "next/link";

const OrderSummaryNew = () => {
  const { panier, loading } = usePanierContext();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const cartItems = panier?.lignes || [];
  const total = cartItems.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0);

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Récapitulatif</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Produit</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Sous-total</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartItems.map((item, key) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
              <div>
                <p className="text-dark">
                  {item.produit?.nom || "Produit"} × {item.quantite}
                </p>
              </div>
              <div>
                <p className="text-dark text-right">
                  {formatPrice(item.prix_unitaire * item.quantite)}
                </p>
              </div>
            </div>
          ))}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryNew;
