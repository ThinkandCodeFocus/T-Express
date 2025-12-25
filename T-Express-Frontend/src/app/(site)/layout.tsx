"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import { AuthProvider } from "@/context/AuthContext";
import { PanierProvider } from "@/context/PanierContext";
import { HeroProvider } from "@/context/HeroContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {loading ? (
        <PreLoader />
      ) : (
        <>
          <ReduxProvider>
            <AuthProvider>
              <PanierProvider>
                <HeroProvider>
                  <CartModalProvider>
                    <ModalProvider>
                      <PreviewSliderProvider>
                        <Header />
                        {children}

                      <QuickViewModal />
                      <CartSidebarModal />
                      <PreviewSliderModal />
                    </PreviewSliderProvider>
                  </ModalProvider>
                </CartModalProvider>
                </HeroProvider>
              </PanierProvider>
            </AuthProvider>
          </ReduxProvider>
          <ScrollToTop />
          <Footer />
        </>
      )}
    </>
  );
}
