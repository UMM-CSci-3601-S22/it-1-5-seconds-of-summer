import { Component, OnInit, Input } from '@angular/core';
import { Shoppinglist } from '../shoppinglist';

@Component({
  selector: 'app-shoppinglist-card',
  templateUrl: './shoppinglist-card.component.html',
  styleUrls: ['./shoppinglist-card.component.scss']
})
export class ShoppinglistCardComponent implements OnInit {
  @Input() shoppinglist: Shoppinglist;
  @Input() simple ? = false;

  constructor() { }

  ngOnInit(): void {
  }

}
