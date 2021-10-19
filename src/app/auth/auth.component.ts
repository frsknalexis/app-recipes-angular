import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { AuthResponseDataModel } from "./auth-response-data.model";
import { Router } from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {

  isLoginMode = true;

  isLoading = false;

  errorMessage: string = null;

  constructor(private authService: AuthService, private router: Router) {
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
          this.isLoading = false;
        });

      authForm.reset();
    }
  }
}
