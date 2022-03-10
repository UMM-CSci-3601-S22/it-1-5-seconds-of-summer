export interface Product {
  _id: string;
  productName: string;
  description: string;
  brand: string;
  category: ProductCategory;
  store: ShoppingStore;
  location: string;
  notes: string;
  //tags: string;
  lifespan: number;
  threshold: number;
  //image: string;
}

export type ProductCategory = 'dry goods' | 'bakery' | 'produce' | 'deli' | 'canned good' | 'cereals' | 'seafood' | 'desserts';
export type ShoppingStore = 'willies' | 'coop' | 'other';
