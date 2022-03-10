import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Product } from '../product';
import { ProductService } from '../product.service';

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

  addProductForm: FormGroup;
  product: Product;


  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  addProductValidationMessages = {
    productName: [
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

 createForms() {

    // add product form validations
    this.addProductForm = this.fb.group({

      // We allow alphanumeric input and limit the length.
      productName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        (fc) => {
          if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
            return ({existingName: true});
          } else {
            return null;
          }
        },
      ])),

      // We allow alphanumeric input and limit the length.
      description: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ])),

      // We allow alphanumeric input and limit the length.
      brand: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ])),

      category: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(dry goods|bakery|produce|deli|canned good|cereals|seafood|desserts)$'),
      ])),

      store: new FormControl('willies', Validators.compose([
        Validators.required,
        Validators.pattern('^(willies|Coop)$'),
      ])),

      // We allow alphanumeric input and limit the length.
      location: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ])),

      // We allow alphanumeric input and limit the length.
      notes: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ])),

      lifespan: new FormControl('', Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(365),
        // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
        // but not that it's a whole number. (The product could still type -27.3232, for example.) So, we also need
        // to include this pattern.
        Validators.pattern('^[0-9]+$')
      ])),

      threshold: new FormControl('', Validators.compose([
        Validators.required,
        Validators.min(0),
        Validators.max(999),
        // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
        // but not that it's a whole number. (The product could still type -27.3232, for example.) So, we also need
        // to include this pattern.
        Validators.pattern('^[0-9]+$')
      ])),
    });
  }


  ngOnInit() {
    this.createForms();
  }

  submitForm() {
    this.productService.addProduct(this.addProductForm.value).subscribe(newID => {
      this.snackBar.open('Added Product ' + this.addProductForm.value.productName, null, {
        duration: 2000,
      });
      this.router.navigate(['/products/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the product', 'OK', {
        duration: 5000,
      });
    });
  }
}
