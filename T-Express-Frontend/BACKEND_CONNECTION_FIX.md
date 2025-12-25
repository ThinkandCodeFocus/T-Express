# 🔧 Solution aux problèmes de connexion backend

## Problème actuel

Toutes les requêtes expirent après 30 secondes, ce qui indique que **le backend Laravel n'est pas démarré ou n'est pas accessible**.

## ✅ Solutions immédiates

### 1. Démarrer le backend Laravel

**Ouvrez un terminal dans le dossier du backend et exécutez :**

```bash
cd T-Express-backend
php artisan serve
```

Le backend devrait démarrer sur `http://localhost:8000`

### 2. Redémarrer le serveur Next.js

**Pour que les changements de timeout soient pris en compte, redémarrez le serveur Next.js :**

1. Arrêtez le serveur actuel (Ctrl+C dans le terminal)
2. Relancez-le :
```bash
cd T-Express-Frontend
npm run dev
```

### 3. Vérifier la configuration

Assurez-vous que le fichier `.env.local` (ou `.env`) contient :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚀 Améliorations apportées

### 1. Timeout réduit à 5 secondes
- Les erreurs apparaîtront beaucoup plus rapidement
- L'application ne restera plus bloquée 30 secondes

### 2. Mode "hors ligne" amélioré
- L'application continue de fonctionner même si le backend n'est pas disponible
- Les composants affichent des données vides au lieu de bloquer
- Messages d'avertissement au lieu d'erreurs bloquantes

### 3. Gestion d'erreurs améliorée
- Messages plus clairs pour diagnostiquer les problèmes
- Logs moins verbeux en production
- Fallback automatique sur le cache quand disponible

### 4. Cache optimisé
- Les données hero sont mises en cache pendant 5 minutes
- En cas d'erreur réseau, le cache est utilisé même s'il est expiré

## 📋 Checklist de vérification

- [ ] Backend Laravel démarré sur `http://localhost:8000`
- [ ] Serveur Next.js redémarré pour prendre en compte les changements
- [ ] Configuration `.env.local` correcte
- [ ] Pas d'erreurs CORS dans la console
- [ ] Le backend répond aux requêtes (tester dans le navigateur : `http://localhost:8000/api/hero/liste`)

## 🔍 Diagnostic

Si les problèmes persistent après avoir démarré le backend :

1. **Vérifier que le backend répond :**
   ```bash
   curl http://localhost:8000/api/hero/liste
   ```
   Ou ouvrez cette URL dans votre navigateur

2. **Vérifier les logs du backend Laravel** pour voir s'il y a des erreurs

3. **Vérifier la configuration CORS** dans `T-Express-backend/config/cors.php`

4. **Vérifier que le port 8000 n'est pas utilisé par un autre service**

## 💡 Mode développement

En mode développement, l'application fonctionne maintenant en "mode dégradé" :
- Les composants s'affichent avec des données vides si le backend n'est pas disponible
- Des messages d'avertissement (⚠️) apparaissent dans la console au lieu d'erreurs bloquantes
- L'interface reste utilisable même sans backend

## 🎯 Prochaines étapes

Une fois le backend démarré :
1. Redémarrer le serveur Next.js
2. Recharger la page dans le navigateur
3. Les données devraient se charger normalement
4. Le timeout sera maintenant de 5 secondes au lieu de 30

