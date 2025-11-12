# Guide de déploiement T-Express

## 📦 Déploiement Frontend (Vercel / Netlify)

### Vercel (Recommandé pour Next.js)

1. **Installer Vercel CLI**
```powershell
npm i -g vercel
```

2. **Se connecter**
```powershell
cd T-Express-Frontend
vercel login
```

3. **Déployer**
```powershell
vercel
```

4. **Variables d'environnement**
Ajouter dans le dashboard Vercel:
```
NEXT_PUBLIC_API_URL=https://api.t-express.sn/api
NEXT_PUBLIC_LOCALE=fr-SN
NEXT_PUBLIC_CURRENCY=XOF
NEXT_PUBLIC_CURRENCY_SYMBOL=FCFA
NEXT_PUBLIC_PHONE_PREFIX=+221
NEXT_PUBLIC_WAVE_API_URL=https://api.wave.com/v1
NEXT_PUBLIC_ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/
NEXT_PUBLIC_ENABLE_WAVE=true
NEXT_PUBLIC_ENABLE_ORANGE_MONEY=true
NEXT_PUBLIC_ADMIN_ROUTE=/admin
NEXT_PUBLIC_ENABLE_ADMIN=true
```

### Netlify

1. **Créer `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. **Déployer**
```powershell
npm i -g netlify-cli
netlify deploy --prod
```

## 🖥️ Déploiement Backend (VPS Linux)

### Prérequis serveur
- Ubuntu 22.04+ / Debian 11+
- PHP 8.2+
- MySQL 8+
- Nginx / Apache
- Composer
- Supervisor (pour les queues)

### 1. Installation sur le serveur

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/T-Express.git
cd T-Express/T-Express-backend

# Installer les dépendances
composer install --optimize-autoloader --no-dev

# Configuration
cp .env.example .env
nano .env  # Éditer avec les bonnes valeurs
php artisan key:generate

# Permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Migrations
php artisan migrate --force

# Storage link
php artisan storage:link

# Cache (production)
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Configuration Nginx

Créer `/etc/nginx/sites-available/t-express`:

```nginx
server {
    listen 80;
    server_name api.t-express.sn;
    root /var/www/T-Express/T-Express-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Activer:
```bash
sudo ln -s /etc/nginx/sites-available/t-express /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.t-express.sn
```

### 4. Configuration PHP-FPM

Éditer `/etc/php/8.2/fpm/php.ini`:

```ini
upload_max_filesize = 20M
post_max_size = 25M
max_execution_time = 300
memory_limit = 512M
```

Redémarrer:
```bash
sudo systemctl restart php8.2-fpm
```

### 5. Configuration MySQL

```sql
CREATE DATABASE t_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 't_express'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT ALL PRIVILEGES ON t_express.* TO 't_express'@'localhost';
FLUSH PRIVILEGES;
```

Dans `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=t_express
DB_USERNAME=t_express
DB_PASSWORD=mot_de_passe_fort
```

### 6. Configuration des queues (Supervisor)

Créer `/etc/supervisor/conf.d/t-express-worker.conf`:

```ini
[program:t-express-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/T-Express/T-Express-backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/T-Express/T-Express-backend/storage/logs/worker.log
stopwaitsecs=3600
```

Activer:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start t-express-worker:*
```

### 7. Tâches cron

Ajouter à `/etc/crontab`:
```
* * * * * cd /var/www/T-Express/T-Express-backend && php artisan schedule:run >> /dev/null 2>&1
```

## 🔐 Sécurité

### 1. Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp  # Seulement si MySQL distant
sudo ufw enable
```

### 2. Fichiers sensibles

Vérifier que `.env` n'est pas accessible:
```bash
chmod 600 .env
```

### 3. Headers de sécurité

Dans Nginx, ajouter:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

## 📊 Monitoring

### 1. Logs Laravel

```bash
tail -f storage/logs/laravel.log
```

### 2. Logs Nginx

```bash
tail -f /var/log/nginx/error.log
```

### 3. Monitoring des queues

```bash
sudo supervisorctl status
```

## 🔄 Mise à jour

```bash
cd /var/www/T-Express/T-Express-backend

# Mettre en mode maintenance
php artisan down

# Récupérer les changements
git pull origin main

# Installer les dépendances
composer install --optimize-autoloader --no-dev

# Migrations
php artisan migrate --force

# Nettoyer le cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Recréer le cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Relancer les workers
sudo supervisorctl restart t-express-worker:*

# Sortir du mode maintenance
php artisan up
```

## 💾 Sauvegarde

### Script de sauvegarde automatique

Créer `/usr/local/bin/backup-t-express.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/t-express"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
DB_NAME="t_express"
DB_USER="t_express"
DB_PASS="mot_de_passe"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup de la base de données
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Backup des fichiers uploadés
tar -czf $BACKUP_DIR/storage-$DATE.tar.gz /var/www/T-Express/T-Express-backend/storage/app/public

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Rendre exécutable et ajouter au cron:
```bash
chmod +x /usr/local/bin/backup-t-express.sh
echo "0 2 * * * /usr/local/bin/backup-t-express.sh" >> /etc/crontab
```

## ✅ Checklist de déploiement

### Avant le déploiement
- [ ] Tests locaux réussis
- [ ] Base de données configurée
- [ ] Variables d'environnement définies
- [ ] SSL/TLS configuré
- [ ] Firewall configuré

### Déploiement Backend
- [ ] Code déployé sur le serveur
- [ ] Dépendances installées
- [ ] Migrations exécutées
- [ ] Storage link créé
- [ ] Cache configuré
- [ ] Queues configurées (Supervisor)
- [ ] Cron configuré
- [ ] Nginx/Apache configuré

### Déploiement Frontend
- [ ] Build production réussi
- [ ] Variables d'environnement configurées
- [ ] Domaine configuré
- [ ] SSL/TLS configuré

### Après le déploiement
- [ ] Tester l'API
- [ ] Tester le frontend
- [ ] Tester les paiements (sandbox)
- [ ] Vérifier les logs
- [ ] Configurer les sauvegardes
- [ ] Configurer le monitoring

## 🆘 Dépannage

### Erreur 500
```bash
# Vérifier les logs
tail -f storage/logs/laravel.log

# Vérifier les permissions
sudo chown -R www-data:www-data storage bootstrap/cache
```

### Erreur CORS
```bash
# Vérifier config/cors.php
# Ajouter le domaine frontend dans allowed_origins
```

### Images non affichées
```bash
# Recréer le lien symbolique
php artisan storage:link
```

---

**T-Express prêt pour la production** 🚀
