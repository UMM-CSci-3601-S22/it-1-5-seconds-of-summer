import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Pantry } from '../pantry';
import { PantryService } from '../pantry.service';


export interface Tag {
  keyword: string;
}

@Component({
  selector: 'app-add-pantry',
  templateUrl: './add-pantry.component.html',
  styleUrls: ['./add-pantry.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false, showError: true}
    }
  ]
})

export class AddPantryComponent implements OnInit {

  isLinear = false;
  addPantryCtrl: FormGroup;

  pantry: Pantry;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];

  // not sure if this name is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  addPantryValidationMessages = {
    productId: [
      {type: 'required', message: 'ProductID is required'},
      {type: 'existingProductId', message: 'ProductID has already been taken'}
    ],

    purchaseDate: [
      {type: 'required', message: 'Purchase Date is required'},
    ],

    tags: [
      {type: 'maxlength', message: 'Too many tags here, cannot be more than 5'}
    ],

    notes: [
      {type: 'minlength', message: 'Notes must be at least 2 characters long'},
      {type: 'maxlength', message: 'Notes cannot be more than 500 characters long'}
    ]
  };

  constructor(private fb: FormBuilder, private pantryService: PantryService, private snackBar: MatSnackBar, private router: Router) {
  }

  createPantryForms() {

    this.addPantryCtrl = this.fb.group({

      pantryRequiredInfo: new FormGroup({

        productId: new FormControl('', Validators.compose([
          Validators.required,
          (fc) => {
            if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
              return ({existingProductId: true});
            } else {
              return null;
            }
          },
        ])),

        purchaseDate: new FormControl('', Validators.compose([
          Validators.required,
        ])),

      }),

      pantryOptionalInfo: new FormGroup({

        tags: new FormControl('', Validators.compose([
          Validators.maxLength(5)
        ])),

        notes: new FormControl('', Validators.compose([
          Validators.minLength(2),
          Validators.maxLength(500)
        ])),

      })
    });
  }

  ngOnInit() {
    this.createPantryForms();
  }

  submitForm() {
    this.pantryService.addPantry(this.addPantryCtrl.value).subscribe(newID => {
      this.snackBar.open('Added Pantry ' + this.addPantryCtrl.value.name, null, {
        duration: 2000,
      });
      this.router.navigate(['/pantrys/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the pantry', 'OK', {
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

