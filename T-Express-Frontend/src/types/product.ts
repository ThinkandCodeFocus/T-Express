export type Product = {
  title: string;
  reviews: number;
  /** Note moyenne sur 5. Absente tant qu'aucun avis n'a ete depose. */
  rating?: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
