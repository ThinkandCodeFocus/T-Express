# Debug: Erreur Paiement Wave `error: {}`

## 🔍 Symptôme
Erreur dans la console frontend lors de l'initiation du paiement Wave:
```
❌ Erreur paiement Wave: {}
```

L'objet d'erreur est vide, ce qui empêche l'affichage d'un message d'erreur utile.

## ✅ Solution Appliquée

### 1. Amélioration de la Gestion d'Erreur dans WavePayment.tsx

**Fichier**: `T-Express-Frontend/src/components/Payment/WavePayment.tsx`  
**Lignes**: 78-98

**Avant**:
```typescript
catch (error: any) {
  console.error('❌ Erreur paiement Wave:', error);
  toast.error(error.message || 'Erreur lors du paiement Wave');
  setLoading(false);
}
```

**Après**:
```typescript
catch (error: any) {
  console.error('❌ Erreur paiement Wave:', error);
  
  // Gestion améliorée des messages d'erreur
  let errorMessage = 'Erreur lors du paiement Wave';
  
  if (error && typeof error === 'object') {
    if (error.message) {
      errorMessage = error.message;
    } else if (error.errors) {
      // Laravel validation errors
      const firstError = Object.values(error.errors)[0];
      if (Array.isArray(firstError)) {
        errorMessage = firstError[0];
      }
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  toast.error(errorMessage);
  setLoading(false);
}
```

## 🎯 Causes Possibles de l'Erreur Vide

### 1. **Backend non accessible**
- **Symptôme**: Erreur réseau, timeout
- **Vérification**: 
  ```powershell
  # Vérifier si Laravel est démarré
  netstat -ano | findstr :8000
  
  # Devrait retourner:
  # TCP    127.0.0.1:8000         0.0.0.0:0              LISTENING
  ```
- **Solution**: Démarrer le backend
  ```bash
  cd T-Express-backend
  php artisan serve
  ```

### 2. **Token d'authentification manquant/invalide**
- **Symptôme**: 401 Unauthorized
- **Vérification**: Ouvrir DevTools > Application > LocalStorage > vérifier `auth_token`
- **Solution**: Se reconnecter sur le frontend

### 3. **Commande inexistante**
- **Symptôme**: 404 Not Found ou validation error
- **Vérification**: Vérifier que la commande existe dans la base de données
  ```sql
  SELECT * FROM commandes WHERE id = <commande_id>;
  ```
- **Solution**: Créer une commande valide via le checkout

### 4. **Configuration Wave manquante**
- **Symptôme**: Erreur dans `WavePaymentService`
- **Vérification**: Vérifier `.env` backend
  ```bash
  WAVE_API_KEY=wave_sn_prod_...
  WAVE_BASE_URL=https://api.wave.com
  WAVE_WEBHOOK_SECRET=wave_sn_WHS_...
  ```
- **Solution**: Ajouter les clés Wave dans `.env`

### 5. **Problème CORS**
- **Symptôme**: Erreur CORS dans la console navigateur
- **Vérification**: Voir console navigateur (F12)
- **Solution**: Vérifier `config/cors.php` dans le backend

## 🧪 Tests de Débogage

### Test 1: Vérifier Backend Accessible
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/api/catalogue/index" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{}' | ConvertTo-Json
```
✅ Si retourne des produits → Backend OK  
❌ Si timeout → Backend non démarré

### Test 2: Vérifier Authentification
Ouvrir DevTools > Console:
```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('auth_token'));

// Tester requête authentifiée
fetch('http://localhost:8000/api/panier/contenu', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: '{}'
}).then(r => r.json()).then(console.log);
```

### Test 3: Tester Endpoint Wave Directement
Dans DevTools > Console:
```javascript
fetch('http://localhost:8000/api/wave/initier', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({ commande_id: 1 })
})
.then(async r => {
  console.log('Status:', r.status);
  const text = await r.text();
  console.log('Response:', text);
  return JSON.parse(text);
})
.then(console.log)
.catch(console.error);
```

## 📊 Interprétation des Erreurs

| Code | Signification | Cause Probable |
|------|--------------|----------------|
| 0 | Aucune réponse | Backend non démarré ou CORS |
| 401 | Unauthorized | Token manquant/invalide |
| 403 | Forbidden | Commande n'appartient pas à l'utilisateur |
| 404 | Not Found | Route inexistante ou commande introuvable |
| 422 | Validation Error | Données manquantes (commande_id) |
| 500 | Server Error | Erreur dans WavePaymentService |

## 🔧 Actions à Prendre

1. **Vérifier la console navigateur** (F12) pour voir l'erreur complète
2. **Vérifier les logs Laravel**: `storage/logs/laravel.log`
3. **Tester avec les commandes de débogage** ci-dessus
4. **Vérifier que l'utilisateur est connecté** et a un token valide
5. **Vérifier qu'une commande existe** avec l'ID fourni

## 💡 Message d'Erreur Amélioré

Avec la nouvelle gestion d'erreur, vous devriez maintenant voir des messages comme:
- ✅ "Cette commande ne vous appartient pas."
- ✅ "Aucun paiement trouvé pour cette commande."
- ✅ "Impossible de se connecter au serveur backend sur http://localhost:8000/api. Vérifiez que le serveur Laravel est démarré."
- ✅ "La requête a expiré après 5000ms. Le backend ne répond pas assez rapidement."

Au lieu de:
- ❌ "Erreur lors du paiement Wave" (message générique)

## 📝 Prochaines Étapes

Si l'erreur persiste après cette modification:
1. Ouvrir la console navigateur (F12)
2. Essayer d'initier un paiement
3. Copier l'erreur complète affichée
4. Vérifier le Network tab pour voir la requête HTTP exacte
5. Partager ces informations pour diagnostic approfondi
