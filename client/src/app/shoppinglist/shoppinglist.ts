export interface Shoppinglist {
  _id: string;
  productName: string;
  quantity: number;
  store: ShoppingStore;

}


export type ShoppingStore = 'willies' | 'coop';
