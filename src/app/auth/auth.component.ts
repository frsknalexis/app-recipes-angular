import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "./auth.service";
import { Observable, Subscription } from "rxjs";
import { AuthResponseDataModel } from "./auth-response-data.model";
import { Router } from "@angular/router";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {

  isLoginMode = true;

  isLoading = false;

  errorMessage: string = null;

  @ViewChild(PlaceholderDirective, { static : false }) alertHost: PlaceholderDirective;

  private closeSubscription: Subscription;

  constructor(private authService: AuthService,
              private router: Router,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    if (authForm.valid) {

      const email = authForm.value.email;
      const password = authForm.value.password;

      this.isLoading = true;

      let authObservable: Observable<AuthResponseDataModel>;

      if (this.isLoginMode) {
        // Login a user when isLogin is equal to TRUE
        authObservable = this.authService.login(email, password);
      } else {
        // Create a  new user when isLoginMode is equal to FALSE
        authObservable = this.authService.signup(email, password);
      }

      authObservable.subscribe(
        (response) => {
          console.log(response);
          this.isLoading = false;
          this.router.navigate(['/recipes']);
          }, (errorMessage) => {
          console.log(errorMessage);
          this.errorMessage = errorMessage;
          this.showErrorAlert(errorMessage);
          this.isLoading = false;
        });

      authForm.reset();
    }
  }

  onHandleError() {
    this.errorMessage = null;
  }

  ngOnDestroy() {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
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
