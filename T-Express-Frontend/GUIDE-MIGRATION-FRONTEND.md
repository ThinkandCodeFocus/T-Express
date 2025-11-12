# 🔄 Guide de Migration Frontend - T-Express

## ✅ Pages déjà adaptées

### 1. Homepage (Page d'accueil)
- ✅ **Categories** - Charge dynamiquement depuis `/api/categories/liste`
- ✅ **BestSeller** - Charge depuis `/api/catalogue/featured`
- ✅ **NewArrivals** - Charge depuis `/api/catalogue/new`

### 2. Shop Pages
- 🔄 **ShopWithSidebar** - En cours d'adaptation
  - Filtres dynamiques (catégories, prix, tri)
  - Pagination API
  - Chargement depuis `/api/catalogue/rechercher`

## 📋 Pages à adapter

### 🛒 Panier (Cart)
**Fichier:** `src/components/Cart/index.tsx`

**Changements nécessaires:**
```typescript
// AVANT (Redux)
const cartItems = useAppSelector((state) => state.cartReducer.items);

// APRÈS (API Context)
const { panier, loading, viderPanier } = usePanier();
const cartItems = panier?.lignes || [];
```

**SingleItem.tsx** - Adapter pour utiliser:
- `usePanier()` hook
- `mettreAJourQuantite(ligne_panier_id, quantite)`
- `supprimerDuPanier(ligne_panier_id)`

### ❤️ Favoris (Wishlist)
**Fichier:** `src/components/Wishlist/index.tsx`

**Changements nécessaires:**
```typescript
// Utiliser le context Favoris
const { favoris, loading, ajouterFavori, supprimerFavori } = useFavoris();
```

**API Endpoints:**
- `POST /api/favoris/liste` - Liste des favoris
- `POST /api/favoris/ajouter` - Ajouter
- `POST /api/favoris/supprimer` - Supprimer

### 🛍️ Détails Produit (ShopDetails)
**Fichier:** `src/components/ShopDetails/index.tsx`

**Changements nécessaires:**
1. Récupérer l'ID du produit depuis l'URL
2. Charger le produit depuis l'API:
```typescript
useEffect(() => {
  const loadProduct = async () => {
    const result = await catalogueService.getDetail(productId);
    setProduct(result.produit);
  };
  loadProduct();
}, [productId]);
```

3. Adapter le bouton "Ajouter au panier" avec `usePanier().ajouterAuPanier()`

### 💳 Checkout
**Fichier:** `src/components/Checkout/index.tsx`

**Changements nécessaires:**
1. Charger les adresses du client:
```typescript
const { user } = useAuth();
const [adresses, setAdresses] = useState([]);

useEffect(() => {
  const loadAdresses = async () => {
    const result = await adresseService.getListe();
    setAdresses(result.adresses);
  };
  loadAdresses();
}, []);
```

2. Créer la commande:
```typescript
const handleCheckout = async () => {
  const result = await commandeService.creer({
    adresse_id: selectedAddressId,
    mode_paiement: paymentMethod, // 'wave' ou 'orange_money'
    telephone_paiement: phone
  });
  
  // Rediriger vers la page de paiement
  if (result.paiement.lien_paiement) {
    window.location.href = result.paiement.lien_paiement;
  }
};
```

### 👤 Mon Compte (MyAccount)
**Fichier:** `src/components/MyAccount/index.tsx`

**Sections à adapter:**

1. **Profil:**
```typescript
const { user, updateProfile } = useAuth();
```

2. **Historique des commandes:**
```typescript
const [commandes, setCommandes] = useState([]);

useEffect(() => {
  const loadOrders = async () => {
    const result = await commandeService.getHistorique();
    setCommandes(result.commandes);
  };
  loadOrders();
}, []);
```

3. **Adresses:**
```typescript
const [adresses, setAdresses] = useState([]);

const handleAddAddress = async (data) => {
  await adresseService.ajouter(data);
  // Recharger les adresses
};

const handleDeleteAddress = async (id) => {
  await adresseService.supprimer(id);
  // Recharger les adresses
};
```

### 🔐 Authentification

**SignIn** (`src/components/SignIn/index.tsx`):
```typescript
const { login, loading, error } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  await login(email, password);
  // Redirection automatique dans le hook
};
```

**SignUp** (`src/components/SignUp/index.tsx`):
```typescript
const { register, loading, error } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  await register({
    nom,
    prenom,
    email,
    password,
    password_confirmation,
    telephone
  });
};
```

## 🎯 Ordre d'adaptation recommandé

1. ✅ **Homepage** (Terminé)
2. 🔄 **Shop Pages** (En cours)
3. **ShopDetails** (Important - Vue produit)
4. **Cart** (Critique - Panier)
5. **Authentication** (Critique - Login/Register)
6. **Checkout** (Critique - Commande)
7. **MyAccount** (Moyen - Profil utilisateur)
8. **Wishlist** (Bas - Favoris)

## 🔧 Hooks et Services disponibles

### Hooks
- `useAuth()` - Authentification
- `usePanier()` - Gestion du panier
- `useFavoris()` - Gestion des favoris
- `useApi()` - Appels API génériques

### Services
- `authService` - Auth (login, register, logout)
- `catalogueService` - Produits (rechercher, detail, featured, new)
- `categorieService` - Catégories (liste, detail)
- `panierService` - Panier (contenu, ajouter, modifier, supprimer)
- `commandeService` - Commandes (creer, historique, detail)
- `avisService` - Avis (soumettre)
- `favoriService` - Favoris (liste, ajouter, supprimer)
- `adresseService` - Adresses (liste, ajouter, supprimer)
- `clientService` - Client (profil, update)

## 📝 Checklist de migration par composant

### Pour chaque page à adapter:

- [ ] Identifier les données statiques actuelles
- [ ] Trouver l'API endpoint correspondant
- [ ] Créer les états `loading` et `data`
- [ ] Utiliser `useEffect` pour charger les données
- [ ] Adapter le composant pour utiliser les données API
- [ ] Ajouter un skeleton de chargement
- [ ] Gérer les erreurs
- [ ] Tester le composant

## 🚀 Exemple complet d'adaptation

### AVANT (Statique):
```typescript
import shopData from "./shopData";

const Shop = () => {
  return (
    <div>
      {shopData.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### APRÈS (Dynamique):
```typescript
import { useState, useEffect } from "react";
import { catalogueService } from "@/services/catalogue.service";
import { adaptProduitsToProducts } from "@/types/adapters";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await catalogueService.rechercher({ per_page: 20 });
      const adapted = adaptProduitsToProducts(result.data);
      setProducts(adapted);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## 🔍 Points d'attention

### Format des données
- Toujours utiliser `adaptProduitsToProducts()` pour convertir les produits API
- Les images doivent utiliser `${API_CONFIG.baseURL}/storage/${image}`
- Les prix sont en FCFA (utiliser `formatCurrency()` pour l'affichage)

### Authentification
- Les routes protégées nécessitent le token dans les headers
- Utiliser `useAuth()` pour vérifier l'état de connexion
- Rediriger vers `/signin` si non connecté

### Gestion des erreurs
```typescript
try {
  await someService.method();
} catch (error) {
  if (error.response?.status === 401) {
    // Non authentifié - rediriger
    router.push('/signin');
  } else if (error.response?.status === 404) {
    // Ressource non trouvée
    setError("Produit introuvable");
  } else {
    // Autre erreur
    setError("Une erreur est survenue");
  }
}
```

## 📚 Documentation

- **API Documentation:** `T-Express-backend/API-DOCUMENTATION.md`
- **Types API:** `src/types/api.types.ts`
- **Config API:** `src/config/api.config.ts`
- **Adaptateurs:** `src/types/adapters.ts`

---

**Prochain composant à adapter:** ShopDetails (Détails produit)
