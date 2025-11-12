# T-Express - E-commerce Platform (Sénégal) 🇸🇳

## 🎯 Vue d'ensemble

T-Express est une plateforme e-commerce complète adaptée au marché sénégalais avec intégration de Wave et Orange Money pour les paiements. Cette documentation vous guide à travers l'architecture, l'installation et l'utilisation du système.

## 🚀 Architecture

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 avec App Router
- **État global**: Redux Toolkit
- **Styling**: Tailwind CSS (design actuel conservé)
- **Localisation**: Français (fr-SN)
- **Paiements**: Wave & Orange Money

### Backend (Laravel 11)
- **Framework**: Laravel 11
- **Base de données**: MySQL
- **Authentification**: Laravel Sanctum
- **API**: RESTful JSON API

## 📦 Installation

### Frontend

```powershell
cd T-Express-Frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
copy .env.example .env.local

# Le frontend sera accessible sur http://localhost:3000
npm run dev
```

### Backend

```powershell
cd T-Express-backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
copy .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env puis:
php artisan migrate
php artisan db:seed

# Lancer le serveur - accessible sur http://localhost:8000
php artisan serve
```

## 📁 Structure complète du Frontend

```
T-Express-Frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   ├── components/             # Composants React (design actuel)
│   │   ├── Payment/           # Wave, Orange Money
│   │   ├── Auth/              # Authentification
│   │   ├── Cart/              # Panier
│   │   └── Admin/             # Dashboard admin (à créer)
│   ├── config/
│   │   └── api.config.ts      # Config API + localisation SN
│   ├── context/
│   │   ├── AuthContext.tsx    # Context auth global
│   │   ├── PanierContext.tsx  # Context panier
│   │   └── FavorisContext.tsx # Context favoris
│   ├── hooks/
│   │   ├── useApi.ts          # Hooks génériques API
│   │   ├── useAuth.ts         # Hook authentification
│   │   ├── usePanier.ts       # Hook panier
│   │   └── useFavoris.ts      # Hook favoris
│   ├── lib/
│   │   ├── api-client.ts      # Client HTTP centralisé
│   │   └── utils.ts           # Utilitaires (format FCFA, tél, etc.)
│   ├── services/              # Services API
│   │   ├── auth.service.ts
│   │   ├── catalogue.service.ts
│   │   ├── panier.service.ts
│   │   ├── commande.service.ts
│   │   ├── paiement.service.ts
│   │   └── admin.service.ts
│   └── types/
│       └── api.types.ts       # Types TypeScript pour l'API
```

## 🔌 Endpoints API complets

Voir le fichier `/T-Express-backend/routes/api.php` pour la liste complète. Les principaux endpoints:

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/auth/register` | POST | Non | Inscription |
| `/auth/login` | POST | Non | Connexion |
| `/auth/logout` | POST | Oui | Déconnexion |
| `/catalogue/index` | POST | Non | Liste produits |
| `/catalogue/rechercher` | POST | Non | Recherche avec filtres |
| `/catalogue/produit` | POST | Non | Détail produit |
| `/panier/contenu` | POST | Oui | Contenu du panier |
| `/panier/ajouter` | POST | Oui | Ajouter au panier |
| `/commande/creer` | POST | Oui | Créer commande |
| `/commande/historique` | POST | Oui | Historique commandes |
| `/favoris/toggle` | POST | Oui | Ajouter/Retirer favori |
| `/avis/soumettre` | POST | Oui | Ajouter un avis |

## 💳 Intégration Paiements (Wave & Orange Money)

Les composants frontend sont prêts:
- `PaymentMethodSelector`: Sélection du mode de paiement
- `WavePayment`: Interface Wave
- `OrangeMoneyPayment`: Interface Orange Money

**TODO Équipe Fintech:**
- Compléter l'implémentation backend dans `/services/paiement.service.ts`
- Configurer les webhooks pour les notifications
- Tester en sandbox avant la production

## 🎨 Utilisation des composants

### Authentification

```typescript
import { useAuthContext } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login } = useAuthContext();

  const handleLogin = async () => {
    await login({ email: 'test@example.com', mot_de_passe: 'password' });
  };

  return isAuthenticated ? <p>Bienvenue {user?.prenom}</p> : <button onClick={handleLogin}>Connexion</button>;
}
```

### Panier

```typescript
import { usePanierContext } from '@/context/PanierContext';

function AddToCart({ produitId }: { produitId: number }) {
  const { ajouter } = usePanierContext();
  
  return (
    <button onClick={() => ajouter({ produit_id: produitId, quantite: 1 })}>
      Ajouter au panier
    </button>
  );
}
```

### Formats locaux (Sénégal)

```typescript
import { formatPrice, formatPhone, formatDate } from '@/lib/utils';

formatPrice(50000);            // "50 000 FCFA"
formatPhone('771234567');       // "+221 77 123 45 67"
formatDate(new Date());         // "26 octobre 2025"
```

## 🛠 Backend - Endpoints à compléter

### 1. Endpoint manquant: `/catalogue/index`

Dans `CatalogueController.php`:

```php
public function index(Request $request)
{
    $perPage = $request->input('per_page', 20);
    
    $produits = Produit::with(['categorie', 'stock'])
        ->where('actif', true)
        ->latest()
        ->paginate($perPage);
    
    return response()->json($produits);
}
```

### 2. Routes Admin (à créer)

Dans `routes/api.php`:

```php
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Produits
    Route::post('produits', [AdminProduitController::class, 'liste']);
    Route::post('produits/creer', [AdminProduitController::class, 'creer']);
    Route::post('produits/modifier', [AdminProduitController::class, 'modifier']);
    Route::post('produits/supprimer', [AdminProduitController::class, 'supprimer']);
    
    // Stock
    Route::post('stock', [AdminStockController::class, 'liste']);
    Route::post('stock/update', [AdminStockController::class, 'update']);
    
    // Dashboard stats
    Route::post('dashboard/stats', [AdminDashboardController::class, 'stats']);
});
```

## 📱 Dashboard Admin

Un exemple de composant admin Dashboard est fourni pour vous guider. Créer les pages suivantes:

- `/admin/dashboard` - Statistiques globales
- `/admin/produits` - Gestion des produits
- `/admin/categories` - Gestion des catégories
- `/admin/commandes` - Gestion des commandes
- `/admin/stock` - Gestion du stock

## 🔐 Sécurité

- Authentification Laravel Sanctum (tokens)
- Validation des données côté client et serveur
- Protection CSRF
- Headers de sécurité HTTP

## 📝 Checklist de déploiement

### Backend
- [ ] Configurer `.env` production
- [ ] Migrer la base de données
- [ ] Configurer le stockage des images
- [ ] Configurer les CORS
- [ ] Activer le cache (`config:cache`, `route:cache`)

### Frontend
- [ ] Configurer `.env.local` production
- [ ] Définir `NEXT_PUBLIC_API_URL`
- [ ] Configurer les clés API Wave/Orange Money
- [ ] Build production: `npm run build`

### Paiements
- [ ] Tester Wave en sandbox
- [ ] Tester Orange Money en sandbox
- [ ] Configurer les webhooks
- [ ] Passer en production

---

**T-Express** - Votre boutique en ligne au Sénégal 🇸🇳
