import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Product } from '../product';
import { ProductService } from '../product.service';

export interface Tag {
  keyword: string;
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false, showError: true}
    }
  ]
})


export class AddProductComponent implements OnInit {

  isLinear = false;
  addProductCtrl: FormGroup;

  product: Product;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];

  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  addProductValidationMessages = {
    name: [
      {type: 'required', message: 'Name is required'},
      {type: 'minlength', message: 'Name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 50 characters long'},
      {type: 'existingName', message: 'Name has already been taken'}
    ],

    description: [
      {type: 'required', message: 'description is required'},
      {type: 'minlength', message: 'description must be at least 2 characters long'},
      {type: 'maxlength', message: 'description cannot be more than 500 characters long'}
    ],

    brand: [
      {type: 'required', message: 'brand is required'},
      {type: 'minlength', message: 'brand must be at least 2 characters long'},
      {type: 'maxlength', message: 'brand cannot be more than 50 characters long'}
    ],

    category: [
      {type: 'required', message: 'Category is required' },
      {type: 'pattern', message: 'Category must be dry goods, bakery, produce, deli, canned good, cereals, seafood or desserts'},
    ],

    store: [
      {type: 'required', message: 'Store is required' },
      {type: 'pattern', message: 'Store must be willey\'s, Pomme de Terre Food Coop or Other'},
    ],

    location: [
      {type: 'required', message: 'location is required'},
      {type: 'minlength', message: 'location must be at least 2 characters long'},
      {type: 'maxlength', message: 'location cannot be more than 100 characters long'}
    ],

    notes: [
      {type: 'required', message: 'notes is required'},
      {type: 'minlength', message: 'notes must be at least 2 characters long'},
      {type: 'maxlength', message: 'notes cannot be more than 500 characters long'}
    ],

    tags: [
      {type: 'maxlength', message: 'too many tags here, cannot be more than 5'}
    ],

    lifespan: [
      {type: 'required', message: 'Lifespan is required'},
      {type: 'min', message: 'Lifespan must be at least 1'},
      {type: 'max', message: 'Lifespan may not be greater than 365'},
      {type: 'pattern', message: 'Lifespan must be a whole number'}
    ],

    threshold: [
      {type: 'required', message: 'Threshold is required'},
      {type: 'min', message: 'Threshold must be at least 0'},
      {type: 'max', message: 'Threshold may not be greater than 999'},
      {type: 'pattern', message: 'Threshold must be a whole number'}
    ]
  };

  constructor(private fb: FormBuilder, private productService: ProductService, private snackBar: MatSnackBar, private router: Router) {
  }

  createProductForms() {

    this.addProductCtrl = this.fb.group({

      productBasicInfo: this.fb.group({
        name: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ])),

        brand: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ])),

        category: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^(dry goods|bakery|produce|deli|canned good|cereals|seafood|desserts)$'),
        ])),

        description: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500)
        ])),
      }),

      productStoreInfo: new FormGroup({
        store: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^(willeys|pomme de terre food coop|other)$'),
        ])),

        location: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ])),
      }),

      productStorageInfo: new FormGroup({
        lifespan: new FormControl('', Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(365),
          Validators.pattern('^[0-9]+$')
        ])),

        threshold: new FormControl('', Validators.compose([
          Validators.required,
          Validators.min(0),
          Validators.max(999),
          Validators.pattern('^[0-9]+$')
        ])),
      }),

      productExtraInfo: new FormGroup({
        notes: new FormControl('', Validators.compose([
          Validators.minLength(2),
          Validators.maxLength(500)
        ])),

        tags: new FormControl('', Validators.compose([
          Validators.maxLength(5)
        ])),
      })
    });
  }

  ngOnInit() {
    this.createProductForms();
  }

  submitForm() {
    this.productService.addProduct(this.addProductCtrl.value).subscribe(newID => {
      this.snackBar.open('Added Product ' + this.addProductCtrl.value.name, null, {
        duration: 2000,
      });
      this.router.navigate(['/products/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the product', 'OK', {
        duration: 5000,
      });
    });
  }

  addTags(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add tags
    if (value) {
      this.tags.push({keyword: value});
    }

    // Clear the input value
    event.chipInput?.clear();
  }

  removeTags(tags: Tag): void {
    const index = this.tags.indexOf(tags);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

}
