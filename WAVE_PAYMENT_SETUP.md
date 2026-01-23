# Configuration de Wave Payment pour T-Express

## Configuration Backend

### 1. Variables d'environnement

Ajoutez ces lignes à votre fichier `.env` :

```env
# Wave Payment Configuration
WAVE_API_KEY=wave_sn_prod_tG8IkjQLLF0BtGDhJ6ANfoA7uDIBjxDMHzNxRodr17nAjdHISZkuj9RCA38eMlxXmlhLf7V
WAVE_BASE_URL=https://api.wave.com

# Frontend URL (pour les redirections après paiement)
FRONTEND_URL=http://localhost:5500
```

**Important :** Remplacez `WAVE_BASE_URL` par l'URL correcte de l'API Wave :
- **Production :** `https://api.wave.com` (à vérifier avec la documentation Wave)
- **Test/Sandbox :** L'URL sandbox si disponible

### 2. Fichiers créés

#### Backend Laravel :
- `app/Services/WavePaymentService.php` - Service pour gérer les appels API Wave
- `app/Http/Controllers/Api/WavePaymentController.php` - Contrôleur pour les endpoints Wave
- Routes ajoutées dans `routes/api.php`

#### Frontend :
- `assets/js/wave-payment.js` - Module JavaScript pour gérer Wave
- `pages/payment-success.html` - Page de succès après paiement
- `pages/payment-error.html` - Page d'erreur de paiement
- Mise à jour de `pages/checkout.js` pour intégrer Wave

### 3. Routes API disponibles

#### Routes protégées (nécessitent authentification) :
- `POST /api/wave/initier` - Initialise un paiement Wave
  ```json
  {
    "commande_id": 123
  }
  ```

- `POST /api/wave/verifier` - Vérifie le statut d'un paiement
  ```json
  {
    "commande_id": 123
  }
  ```

#### Route publique (webhook Wave) :
- `POST /api/wave/callback` - Reçoit les notifications de Wave

## Utilisation Frontend

### 1. Inclure le script Wave

Ajoutez dans votre page `checkout.html` avant la balise `</body>` :

```html
<script src="../assets/js/wave-payment.js"></script>
```

### 2. Ajouter l'option Wave dans le formulaire de paiement

Dans votre formulaire de checkout, ajoutez une option de paiement Wave :

```html
<div class="form-check mb-3">
    <input class="form-check-input" type="radio" name="payment-method" id="payment-wave" value="wave">
    <label class="form-check-label" for="payment-wave">
        <strong>Wave Payment</strong>
        <p class="text-muted small mb-0">Payer avec votre compte Wave</p>
    </label>
</div>
```

## Flux de paiement

1. **Client passe commande** → La commande est créée avec statut "En attente"
2. **Sélection Wave** → Le système initialise le paiement Wave
3. **Redirection vers Wave** → Le client est redirigé vers la page de paiement Wave
4. **Client paie** → Le client effectue le paiement sur Wave
5. **Retour sur le site** → Wave redirige vers `payment-success.html`
6. **Vérification** → Le système vérifie le statut du paiement
7. **Confirmation** → Si payé, la commande passe à "Confirmée"

## URLs de redirection Wave

Le système génère automatiquement :
- **Success URL :** `{FRONTEND_URL}/payment-success.html?commande_id={ID}`
- **Error URL :** `{FRONTEND_URL}/payment-error.html?commande_id={ID}`

## Webhooks (optionnel mais recommandé)

Pour recevoir les notifications en temps réel de Wave, configurez ce webhook dans votre compte Wave :

```
{BACKEND_URL}/api/wave/callback
```

## Points importants

1. **Sécurité :** La clé API est stockée côté serveur uniquement
2. **Vérification :** Le statut est toujours vérifié côté serveur, jamais côté client
3. **Idempotence :** Les paiements peuvent être vérifiés plusieurs fois sans problème
4. **Stock :** Le stock est réservé dès la création de la commande

## Tests

Pour tester l'intégration :

1. Créez une commande avec un produit
2. Sélectionnez "Wave Payment" comme méthode
3. Vous serez redirigé vers Wave
4. Après paiement, vérifiez que :
   - La commande passe à "Confirmée"
   - Le paiement est marqué "Complété"
   - Le client reçoit une confirmation

## Besoin de plus d'informations ?

Pour compléter l'implémentation, j'aurais besoin de :

1. **Documentation officielle Wave API** - Pour vérifier les endpoints exacts
2. **Informations sur les webhooks** - Si Wave utilise des signatures
3. **Montants de test** - Si Wave a des montants spéciaux pour les tests
4. **Format de la réponse API** - Pour affiner le mapping des statuts

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Laravel : `storage/logs/laravel.log`
2. Vérifiez la console JavaScript du navigateur
3. Testez les endpoints avec Postman
4. Vérifiez que la clé API est correcte

## Prochaines étapes recommandées

1. Tester l'intégration avec l'API Wave réelle
2. Configurer les webhooks Wave pour les notifications en temps réel
3. Ajouter des emails de confirmation de paiement
4. Implémenter les remboursements si nécessaire
5. Ajouter des logs détaillés pour le suivi
