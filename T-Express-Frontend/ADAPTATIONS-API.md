# 🎯 Adaptations Frontend T-Express - APIs Dynamiques

## ✅ Modifications Effectuées

### 1. **Backend - Nouvelles APIs**

#### Création du contrôleur CategorieController
**Fichier:** `T-Express-backend/app/Http/Controllers/Api/CategorieController.php`

Nouveaux endpoints:
- `POST /api/categories/liste` - Liste publique des catégories avec sous-catégories
- `POST /api/categories/detail` - Détail d'une catégorie spécifique

#### Mise à jour des routes API
**Fichier:** `T-Express-backend/routes/api.php`

Ajout des routes publiques pour les catégories et complément des routes admin.

### 2. **Frontend - Services et Adaptateurs**

#### Service Catégories
**Fichier:** `src/services/categorie.service.ts`
- Service pour récupérer les catégories depuis l'API

#### Adaptateurs de données
**Fichier:** `src/types/adapters.ts`
- Convertit les données `Produit` de l'API au format `Product` des composants existants
- Gère les images stockées sur le serveur
- Préserve la compatibilité avec les composants existants

#### Configuration API mise à jour
**Fichier:** `src/config/api.config.ts`
- Ajout des endpoints `categories`

### 3. **Frontend - Composants Adaptés** (✅ Design conservé)

#### ✅ Catégories
**Fichier:** `src/components/Home/Categories/index.tsx`
- Charge dynamiquement les catégories depuis l'API
- Affiche un skeleton pendant le chargement
- Design entièrement conservé

**Fichier:** `src/components/Home/Categories/SingleItem.tsx`
- Adapté pour utiliser les données de l'API (`Categorie`)
- Gestion des images depuis le stockage backend
- Liens vers les pages de produits filtrés par catégorie

#### ✅ Best Sellers
**Fichier:** `src/components/Home/BestSeller/index.tsx`
- Charge les produits en vedette depuis l'API
- Utilise `catalogueService.getFeatured()`
- Skeleton de chargement
- Design conservé à 100%

#### ✅ New Arrivals  
**Fichier:** `src/components/Home/NewArrivals/index.tsx`
- Charge les nouveaux produits depuis l'API
- Utilise `catalogueService.getNew()`
- Skeleton de chargement
- Design conservé à 100%

## 📦 Structure des Données

### Catégorie (API)
```typescript
{
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  actif: boolean;
  ordre?: number;
  sous_categories?: Categorie[];
  produits_count?: number;
}
```

### Produit (API) → Product (Composant)
L'adaptateur transforme automatiquement:
- `nom` → `title`
- `prix` → `price`
- `prix_promo` → `discountedPrice`
- `nombre_avis` → `reviews`
- `images` JSON → URLs complètes avec storage

## 🎨 Design

✅ **AUCUN changement visuel** - Tous les styles Tailwind sont conservés
✅ **Animations préservées** - Tous les effets hover et transitions intacts
✅ **Responsive intact** - Breakpoints et grilles conservés
✅ **Swiper fonctionnel** - Carrousels et sliders inchangés

## 🔄 Prochaines Étapes

### Composants à adapter (même approche):

1. **Shop Pages** (`ShopWithSidebar`, `ShopWithoutSidebar`)
   - Utiliser `catalogueService.rechercher()` avec filtres
   - Adapter les filtres de recherche

2. **Shop Details** (`ShopDetails`)
   - Utiliser `catalogueService.getDetail()`
   - Afficher les détails complets du produit

3. **Cart** (`Cart`)
   - Intégrer avec `usePanierContext()`
   - Synchroniser le panier avec le backend

4. **Wishlist** (`Wishlist`)
   - Intégrer avec `useFavorisContext()`
   - Synchroniser les favoris avec le backend

5. **Checkout** (`Checkout`)
   - Utiliser `commandeService.creer()`
   - Intégrer les composants de paiement (Wave/Orange Money)

6. **My Account** (`MyAccount`, `Orders`)
   - Utiliser `clientService` et `commandeService`
   - Afficher l'historique des commandes

## 🚀 Comment utiliser les adaptations

### Exemple: Charger des produits

```typescript
"use client";
import { useEffect, useState } from "react";
import { catalogueService } from "@/services/catalogue.service";
import { adaptProduitsToProducts } from "@/types/adapters";
import type { Product } from "@/types/product";

function MonComposant() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const produits = await catalogueService.getFeatured(10);
      const adapted = adaptProduitsToProducts(produits);
      setProducts(adapted);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  return (
    <div>
      {products.map(product => (
        <ProductItem key={product.id} item={product} />
      ))}
    </div>
  );
}
```

### Exemple: Filtrer par catégorie

```typescript
const loadProductsByCategory = async (categorieId: number) => {
  const result = await catalogueService.rechercher({
    categorie_id: categorieId,
    per_page: 20
  });
  const products = adaptProduitsToProducts(result.data);
  setProducts(products);
};
```

## 📸 Images

Les images sont automatiquement converties:
- **Backend stockage:** `/storage/produits/image.jpg`
- **URL finale:** `http://localhost:8000/storage/produits/image.jpg`

L'adaptateur gère automatiquement la construction des URLs.

## 🔍 Debugging

Si les images ne s'affichent pas:
1. Vérifier que `NEXT_PUBLIC_API_URL` est défini dans `.env.local`
2. Vérifier que les images sont dans `/storage/app/public/` côté Laravel
3. Exécuter `php artisan storage:link` côté backend

Si les données ne chargent pas:
1. Vérifier que le backend est lancé (`php artisan serve`)
2. Vérifier les CORS dans `config/cors.php`
3. Vérifier la console du navigateur pour les erreurs

## ✨ Avantages de cette approche

✅ **Backward compatible** - Les composants existants fonctionnent sans modification majeure
✅ **Progressive** - Peut être déployée page par page
✅ **Maintenable** - Un seul endroit pour adapter les données (adapters.ts)
✅ **Type-safe** - TypeScript garantit la cohérence des données
✅ **Design intact** - Aucun style CSS/Tailwind modifié

---

**Prochaine étape:** Adapter les pages Shop, Cart, Checkout, et My Account avec la même approche ! 🚀
