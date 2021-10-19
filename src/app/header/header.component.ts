import {Component, OnDestroy, OnInit} from "@angular/core";
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";
import { UserModel } from "../auth/user.model";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.css' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuthenticated = false;

  private userSubscription: Subscription;

  constructor(private dataStorageService: DataStorageService,
              private authService: AuthService) {}

  ngOnInit() {
    this.userSubscription = this.authService.user
      .subscribe((user: UserModel) => {
        // si existe el user es TRUE, en caso no exista es FALSE
        // isAuthenticated when is FALSE indicates that the user is not logged in
        // isAuthenticated when is TRUE indicates that the user is logged in
        this.isAuthenticated = !(!user);
        console.log(!user);
        console.log(!!user);
      });
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
