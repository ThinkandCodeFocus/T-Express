# Guide de Test - Intégration Wave Payment

## ✅ Configuration Complète Confirmée

Selon la documentation officielle Wave, l'implémentation est **100% correcte** !

### Configuration Backend

1. **Copiez `.env.example` vers `.env`**
   ```bash
   cd T-Express-backend
   cp .env.example .env
   ```

2. **Vérifiez ces variables dans `.env`**
   ```env
   WAVE_API_KEY=wave_sn_prod_tG8IkjQLLF0BtGDhJ6ANfoA7uDIBjxDMHzNxRodr17nAjdHISZkuj9RCA38eMlxXmlhLf7V
   WAVE_BASE_URL=https://api.wave.com
   FRONTEND_URL=http://localhost:5500
   ```

3. **Important :** Votre clé API commence par `wave_sn_prod_` ce qui indique :
   - `wave_sn` = Wave Sénégal
   - `prod` = Environnement de PRODUCTION
   - ⚠️ **Attention :** Vous utilisez une vraie clé de production !

## 🧪 Test de l'Intégration

### Option 1 : Test avec Postman/Insomnia

#### 1. Créer une commande
```http
POST http://localhost:8000/api/commande/creer
Authorization: Bearer {TOKEN_USER}
Content-Type: application/json

{
  "adresse_livraison_id": 1,
  "adresse_facturation_id": 1
}
```

**Réponse attendue :**
```json
{
  "message": "Commande créée avec succès. En attente de paiement.",
  "commande_id": 123,
  "montant": 50000
}
```

#### 2. Initialiser le paiement Wave
```http
POST http://localhost:8000/api/wave/initier
Authorization: Bearer {TOKEN_USER}
Content-Type: application/json

{
  "commande_id": 123
}
```

**Réponse attendue :**
```json
{
  "message": "Paiement initialisé avec succès",
  "wave_launch_url": "https://pay.wave.com/...",
  "transaction_id": "wvcs_...",
  "paiement_id": 456
}
```

#### 3. Vérifier le statut
```http
POST http://localhost:8000/api/wave/verifier
Authorization: Bearer {TOKEN_USER}
Content-Type: application/json

{
  "commande_id": 123
}
```

### Option 2 : Test via le Frontend

1. **Démarrer le backend**
   ```bash
   cd T-Express-backend
   php artisan serve
   ```

2. **Ouvrir le frontend**
   - Ouvrez `Texpress_front/pages/checkout.html`
   - Ajoutez un produit au panier
   - Connectez-vous
   - Allez au checkout

3. **Passer une commande avec Wave**
   - Sélectionnez une adresse
   - Choisissez "Wave" comme méthode de paiement
   - Cliquez sur "Confirmer la commande"
   - Vous serez redirigé vers Wave

4. **Après paiement**
   - Wave vous redirige vers `payment-success.html`
   - Le système vérifie automatiquement le statut
   - La commande est confirmée si le paiement réussit

## 📊 Vérifier dans la Base de Données

```sql
-- Voir les commandes
SELECT * FROM commandes ORDER BY id DESC LIMIT 5;

-- Voir les paiements
SELECT 
  p.id,
  p.commande_id,
  p.methode,
  p.statut,
  p.montant,
  p.reference_transaction,
  c.statut as statut_commande
FROM paiements p
JOIN commandes c ON p.commande_id = c.id
ORDER BY p.id DESC LIMIT 5;
```

## 🔍 Debugging

### Vérifier les logs Laravel
```bash
tail -f T-Express-backend/storage/logs/laravel.log
```

### Erreurs possibles

#### 401 - Unauthorized
```
La clé API est invalide ou révoquée
```
**Solution :** Vérifiez votre clé dans le Wave Business Portal

#### 403 - Forbidden
```
La clé n'a pas les permissions pour l'API Checkout
```
**Solution :** Dans le Business Portal, donnez l'accès "Checkout API" à votre clé

#### 429 - Too Many Requests
```
Rate limit dépassé
```
**Solution :** Attendez quelques minutes

#### 500 - Internal Server Error
```
Erreur côté Wave
```
**Solution :** Réessayez plus tard ou contactez le support Wave

## 🔐 Configuration Wave Business Portal

1. **Connectez-vous à** https://business.wave.com
2. **Allez dans Developer Section** (uniquement pour Admin)
3. **Vérifiez votre clé API :**
   - Elle doit être active (non révoquée)
   - Elle doit avoir accès à "Checkout API"

4. **Configurer les Webhooks (Recommandé)**
   - URL : `https://votre-domaine.com/api/wave/callback`
   - Cela permet de recevoir les notifications en temps réel

## 💰 Montants de Test

Wave utilise la devise **XOF (Franc CFA)**.

Exemples de montants :
- 1000 XOF = 1 000 FCFA
- 50000 XOF = 50 000 FCFA
- 100000 XOF = 100 000 FCFA

⚠️ **Attention :** Avec votre clé de production, les transactions sont RÉELLES et l'argent sera débité !

## 🚀 Passage en Production

Avant de mettre en production :

1. ✅ **Testez avec de petits montants**
2. ✅ **Configurez les webhooks Wave**
3. ✅ **Activez HTTPS pour votre site**
4. ✅ **Vérifiez que CORS est configuré**
5. ✅ **Testez le flux complet plusieurs fois**
6. ✅ **Configurez les emails de confirmation**

## 📱 Flux Utilisateur Complet

1. Client ajoute des produits au panier
2. Client va au checkout
3. Client sélectionne une adresse de livraison
4. Client choisit "Wave" comme paiement
5. Client clique sur "Confirmer la commande"
6. → Commande créée (statut: "En attente")
7. → Stock réservé
8. → Paiement initialisé avec Wave
9. → Client redirigé vers Wave
10. Client effectue le paiement sur Wave
11. → Wave redirige vers payment-success.html
12. → Le système vérifie le statut
13. → Si payé : Commande → "Confirmée"
14. → Client voit la confirmation

## 🆘 Support

En cas de problème :

1. **Vérifiez les logs** : `storage/logs/laravel.log`
2. **Console navigateur** : F12 → Console
3. **Network tab** : F12 → Network pour voir les requêtes
4. **Base de données** : Vérifiez les tables commandes et paiements

## 📞 Contacts Wave

- Documentation API : https://developer.wave.com
- Support API : Contactez via le Business Portal
- Identifiez vos clés par les 4 derniers caractères

**Votre clé se termine par :** `...mlhLf7V`

---

**Prêt à tester ! 🎉**

Commencez par un petit montant de test pour vérifier que tout fonctionne correctement.
