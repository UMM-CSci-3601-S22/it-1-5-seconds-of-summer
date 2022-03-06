import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-profile',
  templateUrl: './product-profile.component.html',
  styleUrls: ['./product-profile.component.scss']
})
export class ProductProfileComponent implements OnInit, OnDestroy {

  product: Product;
  id: string;
  getProductSub: Subscription;

  constructor(private route: ActivatedRoute, private productService: ProductService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getProductSub) {
        this.getProductSub.unsubscribe();
      }
      this.getProductSub = this.productService.getProductById(this.id).subscribe(product => this.product = this.product);
    });
  }

  ngOnDestroy(): void {
    if (this.getProductSub) {
      this.getProductSub.unsubscribe();
    }
  }

}
