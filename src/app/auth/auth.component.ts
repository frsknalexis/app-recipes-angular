import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { Store } from "@ngrx/store";
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';
import {State} from "./store/auth.reducer";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

  isLoginMode = true;

  isLoading = false;

  errorMessage: string = null;

  @ViewChild(PlaceholderDirective, { static : false }) alertHost: PlaceholderDirective;

  private closeSubscription: Subscription;

  private storeSubscription: Subscription;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private store: Store<fromApp.AppState>) {
  }

  ngOnInit() {
    this.storeSubscription = this.store.select('auth').subscribe((authState: State) => {
      this.isLoading = authState.loading;
      this.errorMessage = authState.authError;

      if (this.errorMessage) {
        this.showErrorAlert(this.errorMessage);
      }
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    if (authForm.valid) {

      const email = authForm.value.email;
      const password = authForm.value.password;

      this.isLoading = true;

      if (this.isLoginMode) {
        // Login a user when isLogin is equal to TRUE
        this.store.dispatch(new AuthActions.LoginStart({
          email: email,
          password: password
        }));
      } else {
        // Create a  new user when isLoginMode is equal to FALSE
        this.store.dispatch(new AuthActions.SignupStart({
          email: email,
          password: password
        }));
      }

      authForm.reset();
    }
  }

  onHandleError() {
    this.store.dispatch(new AuthActions.ClearError());
  }

  ngOnDestroy() {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }

    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  private showErrorAlert(errorMessage: string) {
    const alertComponentFactory = this.componentFactoryResolver
      .resolveComponentFactory<AlertComponent>(AlertComponent);

    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const alertComponentRef = hostViewContainerRef.createComponent<AlertComponent>(alertComponentFactory);

    alertComponentRef.instance.message = errorMessage;
    this.closeSubscription = alertComponentRef.instance.close.subscribe(() => {
      this.closeSubscription.unsubscribe();
      hostViewContainerRef.clear();
    });
  }
}
