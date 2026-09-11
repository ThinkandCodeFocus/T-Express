/** Avis client tel que renvoyé par l'endpoint public avis/recents. */
export type Testimonial = {
  id: number;
  note: number;
  commentaire: string;
  /** "Prénom I." : l'API n'expose ni le nom complet ni l'email. */
  auteur: string;
  produit: { id: number; nom: string };
  created_at: string;
};
