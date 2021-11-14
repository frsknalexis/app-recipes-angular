import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { UserModel } from "../auth/user.model";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import { map } from "rxjs/operators";
import { State } from "../auth/store/auth.reducer";
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.css' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuthenticated = false;

  private userSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.userSubscription = this.store.select('auth')
      .pipe(map((authState: State) => authState.user))
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
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  onFetchData() {
    this.store.dispatch(new RecipeActions.FetchRecipes());
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
