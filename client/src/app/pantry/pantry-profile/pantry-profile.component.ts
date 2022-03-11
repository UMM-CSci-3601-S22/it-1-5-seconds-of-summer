import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pantry } from '../pantry';
import { PantryService } from '../pantry.service';
import { Subscription } from 'rxjs';

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
    // We subscribe to the parameter map here so we'll be notified whenever
    // that changes (i.e., when the URL changes) so this component will update
    // to display the newly requested pantry.
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getPantrySub) {
        this.getPantrySub.unsubscribe();
      }
      this.getPantrySub = this.pantryService.getPantryById(this.id).subscribe(pantry => this.pantry = pantry);
    });
  }

  ngOnDestroy(): void {
    if (this.getPantrySub) {
      this.getPantrySub.unsubscribe();
    }
  }

}
