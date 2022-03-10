import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Pantry } from '../pantry';
import { PantryService } from '../pantry.service';

@Component({
  selector: 'app-pantry-list',
  templateUrl: './pantry-list.component.html',
  styleUrls: ['./pantry-list.component.scss'],
  providers: []
})

export class PantryListComponent implements OnInit, OnDestroy {

  public serverFilteredPantrys: Pantry[];
  public filteredPantrys: Pantry[];

  public prodID: string;
  public date: string;
  public name: string;
  getPantrySub: Subscription;
  public viewType: 'card' | 'list' = 'card';

  panelOpenState = false;

  constructor(private pantryService: PantryService) {

  }

  getPantrysFromServer(): void {
    this.unsub();
    this.getPantrySub = this.pantryService.getPantrys({
      prodID: this.prodID,
      date: this.date,
      name: this.name,
    }).subscribe(returnedPantrys => {
      this.serverFilteredPantrys = returnedPantrys;
      this.updateFilter();
    }, err => {
      console.log(err);
    });
  }
  public updateFilter(): void {
    this.filteredPantrys = this.pantryService.filterPantrys(
      this.serverFilteredPantrys, {
        prodID: this.prodID,
        date: this.date,
        name: this.name,
      });
  }

  ngOnInit(): void {
    this.getPantrysFromServer();
  }

  ngOnDestroy(): void {
    this.unsub();
  }

  unsub(): void {
    if (this.getPantrySub) {
      this.getPantrySub.unsubscribe();
    }
  }
}
