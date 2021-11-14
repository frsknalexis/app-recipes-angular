import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map, take } from "rxjs/operators";
import { UserModel } from "./user.model";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import {State} from "./store/auth.reducer";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router,
              private store: Store<fromApp.AppState>) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> |
    Promise<boolean | UrlTree> |
    boolean | UrlTree {
    return this.store.select('auth').pipe(
      take(1),
      map((authState: State) => authState.user),
      map((user: UserModel) => {
        // si existe el user es TRUE, en caso no exista es FALSE
        const isAuthenticated = (!(!(user)));

        // isAuthenticated is equal to TRUE when user is login, otherwise FALSE

        if (isAuthenticated) {
          return true;
        }

        return this.router.createUrlTree(['/auth']);
      })
    );
  }
}
