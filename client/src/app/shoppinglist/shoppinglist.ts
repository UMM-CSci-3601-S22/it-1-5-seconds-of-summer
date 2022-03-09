export interface Shoppinglist {
  _id: string;
  name: string;
  description: string;
  brand: string;
  category: Category;
  store: ShoppingStore;
  location: string;
  notes: string;
  tags: string;
  lifespan: number;
  threshold: number;
  image: string;
}

export type Category = 'dry goods' | 'bakery' | 'produce' | 'deli' | 'canned good' | 'cereals' | 'seafood' | 'desserts';
export type ShoppingStore = 'willeys' | 'pomme de terre food coop' | 'other';
