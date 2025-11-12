import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Populaire",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Boutique",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "Contact",
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    title: "Pages",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 61,
        title: "Boutique avec barre latérale",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 62,
        title: "Boutique sans barre latérale",
        newTab: false,
        path: "/shop-without-sidebar",
      },
      {
        id: 64,
        title: "Commander",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        title: "Panier",
        newTab: false,
        path: "/cart",
      },
      {
        id: 66,
        title: "Favoris",
        newTab: false,
        path: "/wishlist",
      },
      {
        id: 67,
        title: "Connexion",
        newTab: false,
        path: "/signin",
      },
      {
        id: 68,
        title: "Créer un compte",
        newTab: false,
        path: "/signup",
      },
      {
        id: 69,
        title: "Mon compte",
        newTab: false,
        path: "/my-account",
      },
      {
        id: 70,
        title: "Contact",
        newTab: false,
        path: "/contact",
      },
      {
        id: 62,
        title: "Erreur",
        newTab: false,
        path: "/error",
      },
      {
        id: 63,
        title: "Mail envoyé",
        newTab: false,
        path: "/mail-success",
      },
    ],
  },
  {
    id: 7,
    title: "Blogs",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 71,
        title: "Blog grille avec barre latérale",
        newTab: false,
        path: "/blogs/blog-grid-with-sidebar",
      },
      {
        id: 72,
        title: "Blog grille",
        newTab: false,
        path: "/blogs/blog-grid",
      },
      {
        id: 73,
        title: "Détail blog avec barre latérale",
        newTab: false,
        path: "/blogs/blog-details-with-sidebar",
      },
      {
        id: 74,
        title: "Détail blog",
        newTab: false,
        path: "/blogs/blog-details",
      },
    ],
  },
];
