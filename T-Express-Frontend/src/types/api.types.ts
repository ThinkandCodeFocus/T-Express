/**
 * Types TypeScript pour l'intégration avec l'API Laravel
 * Correspondant aux modèles du backend
 */

// ========== Types de base ==========

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

// ========== Authentification ==========

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  mot_de_passe_confirmation: string;
  telephone?: string;
}

export interface LoginData {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  client: Client;
}

// ========== Client ==========

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_naissance?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateClientData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  date_naissance?: string;
  mot_de_passe?: string;
  mot_de_passe_confirmation?: string;
}

// ========== Produit ==========

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  prix_promo?: number;
  categorie_id: number;
  marque?: string;
  reference?: string;
  couleurs?: string[];
  tailles?: string[];
  images?: string[];
  image_principale?: string;
  en_vedette: boolean;
  nouveau: boolean;
  actif: boolean;
  stock?: Stock;
  categorie?: Categorie;
  avis?: Avis[];
  note_moyenne?: number;
  nombre_avis?: number;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id?: number;
  produit_id: number;
  quantite: number;
  created_at: string;
  updated_at: string;
}

// ========== Catégorie ==========

export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  actif: boolean;
  ordre?: number;
  created_at: string;
  updated_at: string;
  sous_categories?: Categorie[];
  produits_count?: number;
}

// ========== Recherche/Filtres ==========

export interface RechercheFilters {
  mot_cle?: string;
  categorie_id?: number;
  marque?: string[];
  prix_min?: number;
  prix_max?: number;
  couleur?: string[];
  taille?: string[];
  en_vedette?: boolean;
  nouveau?: boolean;
  en_promo?: boolean;
  tri?: 'prix_asc' | 'prix_desc' | 'nom_asc' | 'nom_desc' | 'recent' | 'populaire';
  per_page?: number;
  page?: number;
}

// ========== Panier ==========

export interface LignePanier {
  id: number;
  client_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  couleur?: string;
  taille?: string;
  produit?: Produit;
  created_at: string;
  updated_at: string;
}

export interface PanierContenu {
  lignes: LignePanier[];
  total: number;
  nombre_articles: number;
}

export interface AjouterPanierData {
  produit_id: number;
  quantite: number;
  couleur?: string;
  taille?: string;
}

export interface MettreAJourPanierData {
  ligne_panier_id: number;
  quantite: number;
}

// ========== Adresse ==========

export interface Adresse {
  id: number;
  client_id: number;
  type: 'facturation' | 'livraison';
  nom_complet: string;
  telephone: string;
  adresse_ligne_1: string;
  adresse_ligne_2?: string;
  ville: string;
  region?: string;
  code_postal?: string;
  pays: string;
  par_defaut: boolean;
  created_at: string;
  updated_at: string;
}

export interface AjouterAdresseData {
  type: 'facturation' | 'livraison';
  nom_complet: string;
  telephone: string;
  adresse_ligne_1: string;
  adresse_ligne_2?: string;
  ville: string;
  region?: string;
  code_postal?: string;
  pays: string;
  par_defaut?: boolean;
}

// ========== Commande ==========

export interface Commande {
  id: number;
  client_id: number;
  numero_commande: string;
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee';
  montant_total: number;
  montant_ht: number;
  montant_tva: number;
  frais_livraison: number;
  adresse_livraison_id: number;
  adresse_facturation_id: number;
  notes?: string;
  details?: DetailCommande[];
  paiement?: Paiement;
  livraison?: Livraison;
  adresse_livraison?: Adresse;
  adresse_facturation?: Adresse;
  created_at: string;
  updated_at: string;
}

export interface DetailCommande {
  id: number;
  commande_id: number;
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
  couleur?: string;
  taille?: string;
  produit?: Produit;
  created_at: string;
  updated_at: string;
}

export interface CreerCommandeData {
  adresse_livraison_id: number;
  adresse_facturation_id: number;
  mode_paiement: 'wave' | 'orange_money' | 'cash' | 'carte';
  notes?: string;
  frais_livraison?: number;
}

// ========== Paiement ==========

export interface Paiement {
  id: number;
  commande_id: number;
  montant: number;
  mode_paiement: 'wave' | 'orange_money' | 'cash' | 'carte';
  statut: 'en_attente' | 'complete' | 'echoue' | 'rembourse';
  transaction_id?: string;
  donnees_paiement?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InitierPaiementData {
  commande_id: number;
  mode_paiement: 'wave' | 'orange_money';
  telephone?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface PaiementResponse {
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  qr_code?: string;
  ussd_code?: string;
  message?: string;
}

// ========== Livraison ==========

export interface Livraison {
  id: number;
  commande_id: number;
  statut: 'en_attente' | 'en_cours' | 'livree' | 'echouee';
  transporteur?: string;
  numero_suivi?: string;
  date_expedition?: string;
  date_livraison_estimee?: string;
  date_livraison_reelle?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========== Avis ==========

export interface Avis {
  id: number;
  produit_id: number;
  client_id: number;
  note: number;
  titre?: string;
  commentaire?: string;
  valide: boolean;
  client?: Client;
  created_at: string;
  updated_at: string;
}

export interface SoumettreAvisData {
  produit_id: number;
  commande_id?: number;
  note: number;
  titre?: string;
  commentaire?: string;
}

// ========== Favoris ==========

export interface Favori {
  id: number;
  client_id: number;
  produit_id: number;
  produit?: Produit;
  created_at: string;
  updated_at: string;
}

export interface ToggleFavoriResponse {
  message: string;
  total_favoris: number;
  action: 'added' | 'removed';
}

// ========== Retour ==========

export interface RetourCommande {
  id: number;
  commande_id: number;
  client_id: number;
  statut: 'demande' | 'approuve' | 'refuse' | 'en_cours' | 'complete';
  motif: string;
  description?: string;
  montant_remboursement?: number;
  details?: DetailRetour[];
  created_at: string;
  updated_at: string;
}

export interface DetailRetour {
  id: number;
  retour_commande_id: number;
  detail_commande_id: number;
  quantite: number;
  created_at: string;
  updated_at: string;
}

export interface DemanderRetourData {
  commande_id: number;
  motif: string;
  description?: string;
  produits: Array<{
    detail_commande_id: number;
    quantite: number;
  }>;
}

// ========== Admin ==========

export interface AdminProduitData {
  nom: string;
  description: string;
  prix: number;
  prix_promo?: number;
  categorie_id: number;
  marque?: string;
  reference?: string;
  couleurs?: string[];
  tailles?: string[];
  images?: File[];
  image_principale?: File;
  en_vedette?: boolean;
  nouveau?: boolean;
  actif?: boolean;
  quantite_stock?: number;
}

export interface AdminCategorieData {
  nom: string;
  slug?: string;
  description?: string;
  image?: File;
  parent_id?: number;
  actif?: boolean;
  ordre?: number;
}

export interface DashboardStats {
  total_commandes: number;
  total_ventes: number;
  total_clients: number;
  total_produits: number;
  commandes_en_attente: number;
  stock_faible: number;
  ventes_mois: number;
  croissance_ventes: number;
  top_produits: Array<{
    produit: Produit;
    quantite_vendue: number;
    revenu: number;
  }>;
  commandes_recentes: Commande[];
}

// ========== Blog/Articles ==========

export interface Article {
  id: number;
  titre: string;
  slug: string;
  extrait?: string;
  contenu: string;
  image?: string;
  auteur: string;
  categorie?: string;
  publie: boolean;
  vues: number;
  date_publication: string;
  created_at: string;
  updated_at: string;
  url: string;
  commentaires_count: number;
  commentaires?: CommentaireArticle[];
}

export interface CommentaireArticle {
  id: number;
  article_id: number;
  nom: string;
  email: string;
  commentaire: string;
  approuve: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategorieArticle {
  categorie: string;
  count: number;
}

export interface AjouterCommentaireData {
  article_id: number;
  nom: string;
  email: string;
  commentaire: string;
}
