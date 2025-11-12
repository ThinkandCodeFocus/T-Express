# Guide de démarrage rapide - T-Express

## 🚀 Démarrage en 5 minutes

### 1. Installation Backend (Laravel)

```powershell
cd T-Express-backend

# Installer les dépendances
composer install

# Configuration
copy .env.example .env
php artisan key:generate

# Éditer .env et configurer MySQL:
# DB_DATABASE=t_express
# DB_USERNAME=root
# DB_PASSWORD=votre_mot_de_passe

# Créer la base de données puis:
php artisan migrate

# Lancer le serveur
php artisan serve
```

Le backend sera accessible sur **http://localhost:8000**

### 2. Installation Frontend (Next.js)

```powershell
cd T-Express-Frontend

# Installer les dépendances
npm install

# Configuration
copy .env.example .env.local

# Le .env.local est déjà configuré pour pointer vers le backend local

# Lancer le serveur
npm run dev
```

Le frontend sera accessible sur **http://localhost:3000**

## ✅ Vérification de l'installation

### Tester le backend

```powershell
# Test de l'API
curl http://localhost:8000/api/catalogue/index -X POST -H "Content-Type: application/json"
```

### Tester le frontend

1. Ouvrir **http://localhost:3000** dans le navigateur
2. Le site doit s'afficher avec le design actuel
3. Vérifier la console pour les erreurs

## 📋 Checklist des fonctionnalités

### ✅ Complété (Backend + Frontend)

- [x] Authentification (Register, Login, Logout)
- [x] Gestion du profil client
- [x] Catalogue de produits avec recherche et filtres
- [x] Panier d'achat
- [x] Gestion des adresses
- [x] Création de commandes
- [x] Historique des commandes
- [x] Favoris (Wishlist)
- [x] Avis sur les produits
- [x] Retours de commandes
- [x] Interface de paiement (Wave & Orange Money) - **Frontend prêt**
- [x] Dashboard Admin - **Backend complété**
- [x] Gestion des produits (CRUD) - **Backend complété**
- [x] Gestion des catégories (CRUD) - **Backend complété**
- [x] Gestion du stock - **Backend complété**
- [x] Gestion des commandes (Admin) - **Backend complété**
- [x] Statistiques du dashboard - **Backend complété**
- [x] Formatage local sénégalais (FCFA, téléphone, dates)
- [x] Hooks React personnalisés pour faciliter l'intégration
- [x] Context API pour l'état global (Auth, Panier, Favoris)
- [x] Client HTTP centralisé avec gestion d'erreurs
- [x] Types TypeScript complets pour toute l'API

### 🔄 À compléter (Équipe Fintech)

- [ ] Intégration Wave API (backend)
- [ ] Intégration Orange Money API (backend)
- [ ] Webhooks pour les notifications de paiement
- [ ] Tests en sandbox
- [ ] Mise en production

### 🔄 À compléter (Optionnel)

- [ ] Middleware 'admin' pour protéger les routes admin
- [ ] Notifications par email
- [ ] Système de upload d'images optimisé
- [ ] Cache Redis pour améliorer les performances
- [ ] Tests unitaires et d'intégration

## 📂 Structure des fichiers créés

### Frontend

```
T-Express-Frontend/
├── .env.local                     # Variables d'environnement
├── .env.example                   # Exemple de configuration
├── INTEGRATION.md                 # Documentation d'intégration
├── src/
│   ├── config/
│   │   └── api.config.ts         # ✅ Configuration API et localisation
│   ├── context/
│   │   ├── AuthContext.tsx       # ✅ Context d'authentification
│   │   ├── PanierContext.tsx     # ✅ Context du panier
│   │   └── FavorisContext.tsx    # ✅ Context des favoris
│   ├── hooks/
│   │   ├── useApi.ts             # ✅ Hooks génériques API
│   │   ├── useAuth.ts            # ✅ Hook d'authentification
│   │   ├── usePanier.ts          # ✅ Hook du panier
│   │   └── useFavoris.ts         # ✅ Hook des favoris
│   ├── lib/
│   │   ├── api-client.ts         # ✅ Client HTTP
│   │   └── utils.ts              # ✅ Utilitaires (formats SN)
│   ├── services/
│   │   ├── auth.service.ts       # ✅ Service d'authentification
│   │   ├── client.service.ts     # ✅ Service client
│   │   ├── catalogue.service.ts  # ✅ Service catalogue
│   │   ├── panier.service.ts     # ✅ Service panier
│   │   ├── adresse.service.ts    # ✅ Service adresses
│   │   ├── commande.service.ts   # ✅ Service commandes
│   │   ├── avis.service.ts       # ✅ Service avis
│   │   ├── favori.service.ts     # ✅ Service favoris
│   │   ├── retour.service.ts     # ✅ Service retours
│   │   ├── paiement.service.ts   # ✅ Service paiements
│   │   └── admin.service.ts      # ✅ Service admin
│   ├── components/
│   │   ├── Payment/
│   │   │   ├── PaymentMethodSelector.tsx  # ✅ Sélecteur de paiement
│   │   │   ├── WavePayment.tsx           # ✅ Interface Wave
│   │   │   └── OrangeMoneyPayment.tsx    # ✅ Interface Orange Money
│   │   └── Admin/
│   │       └── Dashboard.tsx             # ✅ Dashboard admin
│   └── types/
│       └── api.types.ts          # ✅ Types TypeScript
```

### Backend

```
T-Express-backend/
├── app/
│   └── Http/
│       └── Controllers/
│           └── Api/
│               ├── Admin/
│               │   ├── AdminProduitController.php    # ✅ CRUD produits
│               │   ├── AdminCategorieController.php  # ✅ CRUD catégories
│               │   ├── AdminCommandeController.php   # ✅ Gestion commandes
│               │   ├── AdminStockController.php      # ✅ Gestion stock
│               │   └── AdminDashboardController.php  # ✅ Statistiques
│               └── CatalogueController.php           # ✅ Index ajouté
└── routes/
    └── api.php                                       # ✅ Routes admin ajoutées
```

## 🎨 Exemples d'utilisation

### Frontend - Authentification

```typescript
import { useAuthContext } from '@/context/AuthContext';

function LoginForm() {
  const { login, loginLoading } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({
      email: 'user@example.com',
      mot_de_passe: 'password'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
      <button disabled={loginLoading}>Connexion</button>
    </form>
  );
}
```

### Frontend - Panier

```typescript
import { usePanierContext } from '@/context/PanierContext';

function ProductCard({ produit }) {
  const { ajouter } = usePanierContext();

  return (
    <button onClick={() => ajouter({ produit_id: produit.id, quantite: 1 })}>
      Ajouter au panier
    </button>
  );
}
```

### Frontend - Formats locaux

```typescript
import { formatPrice, formatPhone } from '@/lib/utils';

formatPrice(50000);         // "50 000 FCFA"
formatPhone('771234567');   // "+221 77 123 45 67"
```

## 🔧 Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_LOCALE=fr-SN
NEXT_PUBLIC_CURRENCY=XOF
NEXT_PUBLIC_CURRENCY_SYMBOL=FCFA
NEXT_PUBLIC_ENABLE_WAVE=true
NEXT_PUBLIC_ENABLE_ORANGE_MONEY=true
```

### Backend (.env)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=t_express
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

## 📚 Documentation complète

Consultez **INTEGRATION.md** pour:
- Architecture détaillée
- Liste complète des endpoints
- Guides d'utilisation avancés
- Exemples de code
- Checklist de déploiement

## 🆘 Support

### Erreurs courantes

**Frontend ne peut pas atteindre le backend:**
- Vérifier que le backend tourne sur http://localhost:8000
- Vérifier le CORS dans `config/cors.php`
- Vérifier `NEXT_PUBLIC_API_URL` dans `.env.local`

**Erreur 401 Unauthorized:**
- Vérifier que le token est sauvegardé
- Réessayer la connexion
- Vérifier que Sanctum est configuré

**Images ne s'affichent pas:**
- Créer le lien symbolique: `php artisan storage:link`
- Vérifier les permissions du dossier `storage/`

## ✨ Le frontend est 100% prêt à recevoir le backend !

Tous les services, hooks, types et composants sont créés et fonctionnels. Le design actuel est conservé. Il suffit de :

1. ✅ Démarrer les deux serveurs
2. ✅ Tester l'authentification
3. ✅ Naviguer dans le site
4. ✅ L'admin peut ajouter des produits via l'API
5. 🔄 Compléter l'intégration des paiements (équipe fintech)

---

**T-Express** - Prêt pour le marché sénégalais 🇸🇳
