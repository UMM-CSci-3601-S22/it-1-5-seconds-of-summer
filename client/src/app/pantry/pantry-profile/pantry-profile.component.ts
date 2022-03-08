import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Pantry } from '../pantry';
import { PantryService } from '../pantry.service';

@Component({
  selector: 'app-pantry-profile',
  templateUrl: './pantry-profile.component.html',
  styleUrls: ['./pantry-profile.component.scss']
})
export class PantryProfileComponent implements OnInit, OnDestroy {

  pantry: Pantry;
  id: string;
  getPantrySub: Subscription;

  constructor(private route: ActivatedRoute, private pantryService: PantryService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getPantrySub) {
        this.getPantrySub.unsubscribe();
      }
      this.getPantrySub = this.pantryService.getPantryById(this.id).subscribe(pantry => this.pantry = this.pantry);
    });
  }

  ngOnDestroy(): void {
    if (this.getPantrySub) {
      this.getPantrySub.unsubscribe();
    }
  }

}

