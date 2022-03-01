import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from './user.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  user$ = this.route.paramMap.pipe(
    switchMap(params => this.userService.getUserById(params.get('id')))
  );

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {

  }


}
