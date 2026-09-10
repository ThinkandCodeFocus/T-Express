Décision — Ticket #12 : Ajouter le blog à la navigation principale

Date : 10/09/2026 Ticket lié : #12 — Ajouter le blog a la navigation principale (menu header) ou le retirer s'il n'est pas utilisé

Contexte

Le menu principal (src/components/Header/menuData.ts) ne contient que "Populaire", "Boutique" et "Contact" : le blog n'est accessible qu'en tapant l'URL directement, aucun lien de navigation n'y mène.

Investigation effectuée

Le système de blog est fonctionnel côté code :

Backend : CRUD complet via AdminArticleController (créer, modifier, supprimer, lister des articles)
Frontend : article.service.ts + pages dédiées (blog-grid, blog-grid-with-sidebar, blog-details, blog-details-with-sidebar)

Vérification en base de données :

App\Models\Article::count();
= 0

Aucun article n'est publié à ce jour.

Décision

menuData.ts n'est pas modifié pour l'instant. Ni ajout du blog au menu, ni suppression des routes.

Justification :

Ajouter un lien vers un blog vide enverrait les visiteurs vers une section sans contenu, ce qui nuit à l'image du site.
Supprimer les routes ferait perdre le travail déjà fait sur le CRUD admin, pour un bénéfice minime.
Le blog n'est pas réellement "orphelin" au sens où rien n'y mène actuellement de façon visible (accessible seulement par URL directe).
Prochaine étape

À réévaluer dès qu'un premier lot d'articles est publié :

Si le blog est conservé dans la roadmap produit → ajouter l'entrée au menu et/ou au footer une fois du contenu disponible.
Si le blog est définitivement abandonné → revenir sur ce ticket pour supprimer proprement les routes et composants associés (src/app/(site)/blogs/*, src/components/Blog*, src/services/article.service.ts).