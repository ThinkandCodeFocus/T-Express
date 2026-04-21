"use client";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal/CartSidebarModalNew";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import { PanierProvider } from "@/context/PanierContext";
import { HeroProvider } from "@/context/HeroContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReduxProvider>
        <AuthProvider>
          <PanierProvider>
            <HeroProvider>
              <CartModalProvider>
                <ModalProvider>
                  <PreviewSliderProvider>
                    <Header />
                    {/* Ajout du ToastProvider pour les notifications */}
                    {require("@/components/Common/ToastProvider").default()}
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
  );
}
