import { Component, OnInit, Input } from '@angular/core';
import { Pantry } from '../pantry';

@Component({
  selector: 'app-pantry-card',
  templateUrl: './pantry-card.component.html',
  styleUrls: ['./pantry-card.component.scss']
})
export class PantryCardComponent implements OnInit {

  @Input() pantry: Pantry;
  @Input() simple ? = false;

  constructor() { }

  ngOnInit(): void {
  }

}
