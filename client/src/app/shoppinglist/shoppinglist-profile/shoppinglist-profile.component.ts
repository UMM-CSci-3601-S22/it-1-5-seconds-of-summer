import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Shoppinglist } from '../shoppinglist';
import { ShoppinglistService } from '../shoppinglist.service';

@Component({
  selector: 'app-shoppinglist-profile',
  templateUrl: './shoppinglist-profile.component.html',
  styleUrls: ['./shoppinglist-profile.component.scss']
})

export class ShoppinglistProfileComponent implements OnInit, OnDestroy {

  shoppinglist: Shoppinglist;
  id: string;
  getShoppinglistSub: Subscription;

  constructor(private route: ActivatedRoute, private shoppinglistService: ShoppinglistService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getShoppinglistSub) {
        this.getShoppinglistSub.unsubscribe();
      }
      this.getShoppinglistSub = this.shoppinglistService
      .getShoppinglistById(this.id)
      .subscribe(shoppinglist => this.shoppinglist = this.shoppinglist);
    });
  }

  ngOnDestroy(): void {
    if (this.getShoppinglistSub) {
      this.getShoppinglistSub.unsubscribe();
    }
  }

}
