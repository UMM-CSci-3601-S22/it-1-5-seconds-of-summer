import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Shoppinglist, Category, ShoppingStore } from '../shoppinglist';
import { ShoppinglistService } from '../shoppinglist.service';

@Component({
  selector: 'app-shoppinglist-list',
  templateUrl: './shoppinglist-list.component.html',
  styleUrls: ['./shoppinglist-list.component.scss']
})
export class ShoppinglistListComponent implements OnInit, OnDestroy {

  public serverFilteredShoppinglists: Shoppinglist[];
  public filteredShoppinglists: Shoppinglist[];

  public shoppinglistName: string;
  public shoppinglistDescription: string;
  public shoppinglistBrand: string;
  public shoppinglistCategory: Category;
  public shoppinglistStore: ShoppingStore;
  public shoppinglistLocation: string;
  public shoppinglistNotes: string;
  public shoppinglistTags: string;
  public shoppinglistLifespan: number;
  public shoppinglistThreshold: number;
  getShoppinglistSub: Subscription;
  public viewType: 'card' | 'list' = 'card';

  panelOpenState = false;

  constructor(private shoppinglistService: ShoppinglistService) {

  }

  getShoppinglistsFromServer(): void {
    this.unsub();
    this.getShoppinglistSub = this.shoppinglistService.getShoppinglists({
      name: this.shoppinglistName,
      description: this.shoppinglistDescription,
      brand: this.shoppinglistBrand,
      category: this.shoppinglistCategory,
      store: this.shoppinglistStore,
      location: this.shoppinglistLocation,
      notes: this.shoppinglistNotes,
      tags: this.shoppinglistTags,
      lifespan: this.shoppinglistLifespan,
      threshold: this.shoppinglistThreshold
    }).subscribe(returnedShoppinglists => {
      this.serverFilteredShoppinglists = returnedShoppinglists;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }
  public updateFilter(): void {
    this.filteredShoppinglists = this.shoppinglistService.filterShoppinglists(
      this.serverFilteredShoppinglists, {
        name: this.shoppinglistName,
        description: this.shoppinglistDescription,
        brand: this.shoppinglistBrand,
        category: this.shoppinglistCategory,
        store: this.shoppinglistStore,
        location: this.shoppinglistLocation,
        notes: this.shoppinglistNotes,
        tags: this.shoppinglistTags,
        lifespan: this.shoppinglistLifespan,
        threshold: this.shoppinglistThreshold
      });
  }

  ngOnInit(): void {
    this.getShoppinglistsFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getShoppinglistSub) {
      this.getShoppinglistSub.unsubscribe();
    }
  }
}
