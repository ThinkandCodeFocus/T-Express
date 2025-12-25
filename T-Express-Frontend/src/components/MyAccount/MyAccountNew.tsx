"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import OrdersNew from "../Orders/OrdersNew";
import { useAuthContext } from "@/context/AuthContext";
import { adresseService } from "@/services/adresse.service";
import { clientService } from "@/services/client.service";
import type { Adresse, UpdateClientData } from "@/types/api.types";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/Common/PhoneInput";
import { validatePhone } from "@/lib/utils";

const MyAccountNew = () => {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // States pour les adresses
  const [adresses, setAdresses] = useState<Adresse[]>([]);
  const [loadingAdresses, setLoadingAdresses] = useState(true);
  
  // States pour l'édition du profil
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    telephone: user?.telephone || ""
  });

  // States pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Charger les adresses
  useEffect(() => {
    if (!user) return;

    const loadAdresses = async () => {
      try {
        const data = await adresseService.getListe();
        setAdresses(data);
      } catch (error) {
        console.error("Erreur lors du chargement des adresses:", error);
      } finally {
        setLoadingAdresses(false);
      }
    };

    loadAdresses();
  }, [user]);

  // Gérer la soumission du profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Valider le téléphone si fourni
    if (profileData.telephone && !validatePhone(profileData.telephone)) {
      alert("Le numéro de téléphone n'est pas valide. Format attendu : +221 XX XXX XX XX");
      return;
    }

    try {
      await clientService.updateProfil(profileData);
      alert("Profil mis à jour avec succès !");
      setEditingProfile(false);
      window.location.reload(); // Recharger pour afficher les nouvelles données
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      alert(error.message || "Erreur lors de la mise à jour du profil");
    }
  };

  // Gérer le changement de mot de passe
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await clientService.updateProfil({
        mot_de_passe: passwordData.newPassword,
        mot_de_passe_confirmation: passwordData.confirmPassword
      });
      
      alert("Mot de passe modifié avec succès !");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error("Erreur lors du changement de mot de passe:", error);
      alert(error.message || "Erreur lors du changement de mot de passe");
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <>
        <Breadcrumb title={"Mon Compte"} pages={["mon compte"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-xl shadow-1 p-10 text-center">
              <h2 className="text-2xl font-medium text-dark mb-4">Connexion requise</h2>
              <p className="text-lg mb-6">Vous devez être connecté pour accéder à votre compte</p>
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

  return (
    <>
      <Breadcrumb title={"Mon Compte"} pages={["mon compte"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* User dashboard menu */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden bg-gray-2 flex items-center justify-center">
                    <svg
                      className="fill-current text-gray-5"
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path d="M16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4ZM6 24C6 20.6863 8.68629 18 12 18H20C23.3137 18 26 20.6863 26 24V26C26 27.1046 25.1046 28 24 28H8C6.89543 28 6 27.1046 6 26V24Z" />
                    </svg>
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {user.prenom} {user.nom}
                    </p>
                    <p className="text-custom-xs">{user.email}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "dashboard"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.91002 1.60413C5.08642 1.6041 4.39962 1.60408 3.85441 1.67738C3.27893 1.75475 2.75937 1.92495 2.34185 2.34246C1.92434 2.75998 1.75414 3.27954 1.67677 3.85502C1.60347 4.40023 1.60349 5.08701 1.60352 5.9106V6.00596C1.60349 6.82956 1.60347 7.51636 1.67677 8.06157C1.75414 8.63705 1.92434 9.15661 2.34185 9.57413C2.75937 9.99164 3.27893 10.1618 3.85441 10.2392C4.39962 10.3125 5.0864 10.3125 5.90999 10.3125H6.00535C6.82894 10.3125 7.51575 10.3125 8.06096 10.2392C8.63644 10.1618 9.156 9.99164 9.57352 9.57413C9.99103 9.15661 10.1612 8.63705 10.2386 8.06157C10.3119 7.51636 10.3119 6.82958 10.3119 6.00599V5.91063C10.3119 5.08704 10.3119 4.40023 10.2386 3.85502C10.1612 3.27954 9.99103 2.75998 9.57352 2.34246C9.156 1.92495 8.63644 1.75475 8.06096 1.67738C7.51575 1.60408 6.82897 1.6041 6.00538 1.60413H5.91002ZM3.31413 3.31474C3.43358 3.19528 3.61462 3.09699 4.03763 3.04012C4.48041 2.98059 5.07401 2.97913 5.95768 2.97913C6.84136 2.97913 7.43496 2.98059 7.87774 3.04012C8.30075 3.09699 8.48179 3.19528 8.60124 3.31474C8.7207 3.43419 8.81899 3.61523 8.87586 4.03824C8.93539 4.48102 8.93685 5.07462 8.93685 5.9583C8.93685 6.84197 8.93539 7.43557 8.87586 7.87835C8.81899 8.30136 8.7207 8.4824 8.60124 8.60186C8.48179 8.72131 8.30075 8.8196 7.87774 8.87647C7.43496 8.936 6.84136 8.93746 5.95768 8.93746C5.07401 8.93746 4.48041 8.936 4.03763 8.87647C3.61462 8.8196 3.43358 8.72131 3.31413 8.60186C3.19467 8.4824 3.09638 8.30136 3.03951 7.87835C2.97998 7.43557 2.97852 6.84197 2.97852 5.9583C2.97852 5.07462 2.97998 4.48102 3.03951 4.03824C3.09638 3.61523 3.19467 3.43419 3.31413 3.31474Z"
                          fill=""
                        />
                      </svg>
                      Tableau de bord
                    </button>
                    
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        <path d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z" fill=""/>
                      </svg>
                      Mes commandes
                    </button>

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "addresses"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        <path d="M8.25065 15.8125C7.87096 15.8125 7.56315 16.1203 7.56315 16.5C7.56315 16.8797 7.87096 17.1875 8.25065 17.1875H13.7507C14.1303 17.1875 14.4382 16.8797 14.4382 16.5C14.4382 16.1203 14.1303 15.8125 13.7507 15.8125H8.25065Z" fill=""/>
                      </svg>
                      Mes adresses
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "account-details"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581Z" fill=""/>
                      </svg>
                      Mon profil
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-red hover:text-white text-dark-2 bg-gray-1"
                    >
                      <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        <path d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z" fill=""/>
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard tab */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "dashboard" ? "block" : "hidden"
              }`}
            >
              <p className="text-dark mb-4">
                Bonjour <span className="font-medium">{user.prenom} {user.nom}</span> !
              </p>

              <p className="text-custom-sm">
                Depuis votre tableau de bord, vous pouvez consulter vos commandes récentes, 
                gérer vos adresses de livraison et de facturation, et modifier votre mot de passe et vos informations de compte.
              </p>
            </div>

            {/* Orders tab */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <OrdersNew />
            </div>

            {/* Addresses tab */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "addresses" ? "block" : "hidden"
              }`}
            >
              <div className="bg-white shadow-1 rounded-xl p-4 sm:p-7.5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-medium text-xl text-dark">Mes adresses</h3>
                  <a 
                    href="/my-account/addresses/new"
                    className="text-blue hover:text-blue-dark"
                  >
                    + Ajouter une adresse
                  </a>
                </div>

                {loadingAdresses ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2].map(i => (
                      <div key={i} className="h-32 bg-gray-2 rounded-lg"></div>
                    ))}
                  </div>
                ) : adresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {adresses.map((adresse) => (
                      <div key={adresse.id} className="border border-gray-3 rounded-lg p-5">
                        <h4 className="font-medium text-dark mb-3 capitalize">
                          Adresse de {adresse.type}
                        </h4>
                        <div className="text-custom-sm space-y-2">
                          <p>{adresse.adresse_ligne_1}</p>
                          {adresse.adresse_ligne_2 && <p>{adresse.adresse_ligne_2}</p>}
                          <p>{adresse.ville}, {adresse.code_postal}</p>
                          <p>{adresse.pays}</p>
                          {adresse.telephone && <p>Tél: {adresse.telephone}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10">Aucune adresse enregistrée</p>
                )}
              </div>
            </div>

            {/* Account details tab */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              <form onSubmit={handleProfileSubmit}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-7">
                  <h3 className="font-medium text-xl text-dark mb-5">Informations personnelles</h3>
                  
                  <div className="flex flex-col lg:flex-row gap-5 mb-5">
                    <div className="w-full">
                      <label htmlFor="prenom" className="block mb-2.5">
                        Prénom <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                        disabled={!editingProfile}
                        className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                        required
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="nom" className="block mb-2.5">
                        Nom <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                        disabled={!editingProfile}
                        className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <PhoneInput
                      id="telephone"
                      value={profileData.telephone || ""}
                      onChange={(value) => setProfileData({...profileData, telephone: value})}
                      disabled={!editingProfile}
                      placeholder="+221 XX XXX XX XX"
                      label="Téléphone"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block mb-2.5">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="rounded-md border border-gray-3 bg-gray-2 w-full py-2.5 px-5 opacity-50"
                    />
                    <p className="text-xs text-gray-5 mt-1">L'email ne peut pas être modifié</p>
                  </div>

                  {editingProfile ? (
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileData({
                            nom: user.nom,
                            prenom: user.prenom,
                            telephone: user.telephone || ""
                          });
                        }}
                        className="inline-flex font-medium text-dark bg-gray-1 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      Modifier mon profil
                    </button>
                  )}
                </div>
              </form>

              <form onSubmit={handlePasswordChange}>
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-dark mb-5">Changer le mot de passe</h3>

                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      minLength={6}
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="confirmPassword" className="block mb-2.5">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MyAccountNew;
