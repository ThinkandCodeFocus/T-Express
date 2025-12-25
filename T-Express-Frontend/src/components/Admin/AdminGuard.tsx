"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Composant de protection pour les routes admin
 * Vérifie que l'utilisateur est authentifié et a le rôle admin
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      // Attendre que le hook useAuth ait fini de charger
      if (loading) {
        return;
      }

      // Vérifier si l'utilisateur est authentifié
      if (!isAuthenticated || !authService.isAuthenticated()) {
        console.warn("Accès admin refusé : utilisateur non authentifié");
        router.push("/login");
        return;
      }

      // Récupérer les données utilisateur depuis le localStorage
      const userData = authService.getUserData();

      // Vérifier si l'utilisateur a le rôle admin
      if (!userData || userData.role !== "admin") {
        console.warn("Accès admin refusé : rôle insuffisant", {
          userRole: userData?.role,
          userEmail: userData?.email,
        });
        // Rediriger vers la page d'accueil avec un message d'erreur
        router.push("/?error=access_denied");
        return;
      }

      // Vérifier spécifiquement l'email admin autorisé
      if (userData.email !== "t-express@t-express.com") {
        console.warn("Accès admin refusé : email non autorisé", {
          userEmail: userData.email,
        });
        router.push("/?error=access_denied");
        return;
      }

      setIsChecking(false);
    };

    checkAdminAccess();
  }, [isAuthenticated, loading, router, user]);

  // Afficher un loader pendant la vérification
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-1">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-light-5 border-t-blue rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-8 h-8 border-4 border-blue-light-4 border-t-blue-light-2 rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas admin, ne rien afficher (la redirection est en cours)
  const userData = authService.getUserData();
  if (!userData || userData.role !== "admin" || userData.email !== "t-express@t-express.com") {
    return null;
  }

  return <>{children}</>;
}

