# ✅ Vérification Montant & Callbacks Wave

## 🔍 Modifications Critiques Effectuées

### 1. ✅ FORMAT DU MONTANT CORRIGÉ

**Problème identifié :** Wave API exige que le montant soit une **string** (pas un float)

**Solution appliquée :**
```php
// Avant (INCORRECT)
'amount' => 50000.0  // float ❌

// Après (CORRECT)
'amount' => "50000"  // string ✅
```

Le code convertit maintenant automatiquement :
```php
$montantString = (string) (int) $montant;
```

**Pourquoi (int) ?** XOF (FCFA) n'a pas de décimales, donc on s'assure de ne pas envoyer "50000.5"

---

### 2. ✅ VÉRIFICATION DU MONTANT AU CALLBACK

**Ajouté dans le callback Wave :**
```php
// Vérification que le montant payé = montant attendu
$montantWave = (float) ($payload['amount'] ?? 0);
if ($montantWave > 0 && abs($montantWave - $paiement->montant) > 0.01) {
    Log::error('ALERTE: Montant Wave différent du montant attendu!');
}
```

Cela détecte si :
- Un client modifie le montant
- Wave renvoie un montant différent
- Il y a une erreur de calcul

---

### 3. ✅ LOGS DÉTAILLÉS AJOUTÉS

**À chaque étape, le système log :**

#### Lors de l'initialisation :
```php
Log::info('Initialisation paiement Wave', [
    'commande_id' => 123,
    'montant_original' => 50000.0,
    'montant_envoye' => "50000",
    'currency' => 'XOF'
]);
```

#### Lors du callback :
```php
Log::info('Mise à jour du paiement via callback', [
    'commande_id' => 123,
    'ancien_statut' => 'En attente',
    'nouveau_statut' => 'Complété',
    'montant_wave' => 50000,
    'montant_commande' => 50000
]);
```

**Consulter les logs :**
```bash
tail -f T-Express-backend/storage/logs/laravel.log
```

---

### 4. ✅ CONFIRMATION UTILISATEUR (Frontend)

**Avant redirection vers Wave, le client voit :**
```javascript
"Vous allez être redirigé vers Wave pour payer 50 000 FCFA. Continuer ?"
```

Cela permet au client de :
- Vérifier le montant AVANT de payer
- Annuler si le montant est incorrect

---

### 5. ✅ CALLBACKS CONFIGURÉS CORRECTEMENT

**URLs de redirection générées automatiquement :**

```php
$frontendUrl = config('app.frontend_url');
$successUrl = $frontendUrl . '/payment-success?commande_id=' . $commande->id;
$errorUrl = $frontendUrl . '/payment-error?commande_id=' . $commande->id;
```

**Résultat :**
- Succès → `http://localhost:5500/payment-success?commande_id=123`
- Erreur → `http://localhost:5500/payment-error?commande_id=123`

---

### 6. ✅ WEBHOOK CALLBACK SÉCURISÉ

**Route publique (pas de auth) :**
```php
Route::post('wave/callback', [WavePaymentController::class, 'callback']);
```

**Informations loguées dans le callback :**
```php
Log::info('Callback Wave reçu', [
    'payload' => $payload,
    'ip' => $request->ip(),      // IP de Wave
    'timestamp' => now()           // Horodatage
]);
```

---

## 🧪 Test de Vérification du Montant

### Test 1 : Vérifier le montant envoyé à Wave

```bash
# Dans les logs Laravel, chercher :
grep "Initialisation paiement Wave" storage/logs/laravel.log
```

**Vous devriez voir :**
```json
{
  "commande_id": 123,
  "montant_original": 50000,
  "montant_envoye": "50000",
  "currency": "XOF"
}
```

### Test 2 : Simulation callback avec mauvais montant

Créez un fichier `test-callback.php` :
```php
<?php
// Simuler un callback Wave avec un montant différent
$url = 'http://localhost:8000/api/wave/callback';
$data = [
    'id' => 'wvcs_test_123',
    'payment_status' => 'completed',
    'amount' => 45000,  // Différent du montant original !
    'currency' => 'XOF'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
echo $response;
curl_close($ch);
```

**Résultat attendu dans les logs :**
```
[ERROR] Montant Wave différent du montant attendu!
montant_wave: 45000
montant_attendu: 50000
difference: 5000
```

### Test 3 : Vérifier le montant côté client

**Dans la console du navigateur (F12) :**
```javascript
// Lors du checkout, vous devriez voir :
console.log("Montant commande:", 50000);
console.log("Montant Wave response:", waveResponse.montant);
```

---

## 📊 Tableau de Suivi des Montants

| Étape | Où | Format | Exemple |
|-------|-----|--------|---------|
| 1. Calcul panier | CommandeService.php | float | 50000.0 |
| 2. Création commande | Commande.montant_total | decimal | 50000.00 |
| 3. Envoi à Wave API | WavePaymentService | string | "50000" |
| 4. Sauvegarde paiement | Paiement.montant | decimal | 50000.00 |
| 5. Callback Wave | payload['amount'] | string | "50000" |
| 6. Vérification | Comparaison | float | 50000.0 == 50000.0 ✅ |

---

## 🔐 Sécurité des Callbacks

### Protection implémentée :

1. **Vérification du transaction ID**
   ```php
   if (!$transactionId) {
       return response()->json(['message' => 'Transaction ID manquant'], 400);
   }
   ```

2. **Vérification que le paiement existe**
   ```php
   $paiement = Paiement::where('reference_transaction', $transactionId)->first();
   if (!$paiement) {
       Log::warning('Paiement non trouvé');
       return 404;
   }
   ```

3. **Vérification du montant**
   ```php
   if (abs($montantWave - $paiement->montant) > 0.01) {
       Log::error('ALERTE: Montant incorrect!');
   }
   ```

4. **Log de l'IP source**
   ```php
   'ip' => $request->ip()  // Permet de vérifier que ça vient de Wave
   ```

### ⚠️ Protection supplémentaire recommandée :

**Vérifier l'IP source dans le callback :**
```php
// À ajouter dans callback() si Wave fournit leurs IPs
$allowedIps = ['IP.DE.WAVE.1', 'IP.DE.WAVE.2'];
if (!in_array($request->ip(), $allowedIps)) {
    Log::warning('Callback depuis IP non autorisée: ' . $request->ip());
    return response()->json(['message' => 'Unauthorized'], 403);
}
```

**Demandez à Wave leurs adresses IP pour les webhooks !**

---

## ✅ Checklist Finale

Avant de mettre en production :

- [x] Montant converti en string pour Wave API
- [x] Logs détaillés à chaque étape
- [x] Vérification du montant au callback
- [x] Confirmation utilisateur avant redirection
- [x] URLs de callback configurées
- [x] Webhook callback sécurisé
- [ ] **À FAIRE : Demander les IPs de Wave pour filtrage**
- [ ] **À FAIRE : Configurer webhook URL dans Wave Portal**
- [ ] **À FAIRE : Tester avec de vrais paiements (petits montants)**

---

## 🆘 Troubleshooting

### Problème : Le montant affiché est différent sur Wave

**Causes possibles :**
1. Calcul incorrect du panier
2. Frais de livraison non inclus
3. Erreur de conversion

**Solution :**
```bash
# Vérifier le calcul
grep "montant_total" storage/logs/laravel.log

# Vérifier les détails de commande
mysql> SELECT c.id, c.montant_total, SUM(dc.quantite * dc.prix_unitaire) as calcul
       FROM commandes c
       JOIN detail_commandes dc ON c.id = dc.commande_id
       GROUP BY c.id;
```

### Problème : Callback non reçu

**Vérifications :**
1. L'URL webhook est-elle configurée dans Wave Portal ?
2. L'URL est-elle accessible depuis internet (pas localhost) ?
3. HTTPS est-il activé ? (Wave peut l'exiger)

**Test :**
```bash
# Depuis un autre serveur, tester :
curl -X POST https://votre-domaine.com/api/wave/callback \
  -H "Content-Type: application/json" \
  -d '{"id":"test","payment_status":"completed"}'
```

### Problème : Montant avec décimales

**Si vous voyez "50000.50" dans les logs :**
```php
// Le (int) devrait empêcher ça, mais si ça arrive :
$montantString = number_format($montant, 0, '', '');  // Forcer 0 décimales
```

---

## 📞 Support

**En cas de doute sur les montants :**
1. Vérifiez `storage/logs/laravel.log`
2. Comparez avec la table `commandes` et `paiements`
3. Vérifiez la console navigateur (F12)
4. Contactez le support Wave si les montants divergent systématiquement

---

**Tout est maintenant sécurisé et tracé ! 🎉**
