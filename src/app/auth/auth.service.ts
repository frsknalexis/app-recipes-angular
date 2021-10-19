import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AuthResponseDataModel } from "./auth-response-data.model";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import { UserModel } from "./user.model";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = new BehaviorSubject<UserModel>(null);

  private tokenExpirationTimer: any;

  constructor(private httpClient: HttpClient,
              private router: Router) {
  }

  signup(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseDataModel>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBMB20noNnHxL23I0SR3Fu_m-KUkuqoSAE',
        {
          email: email,
          password: password,
          returnSecureToken: true
        })
      .pipe(catchError((errorResponse) => {
        return this.handleError(errorResponse)
      }), tap((response) => {
        this.handleAuthentication(
          response.email,
          response.localId,
          response.idToken,
          +response.expiresIn);
      }));
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<AuthResponseDataModel>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBMB20noNnHxL23I0SR3Fu_m-KUkuqoSAE',
        {
          email: email,
          password: password,
          returnSecureToken: true
        })
      .pipe(catchError((errorResponse) => {
        return this.handleError(errorResponse);
      }), tap((responseData) => {
        this.handleAuthentication(
          responseData.email,
          responseData.localId,
          responseData.idToken,
          +responseData.expiresIn);
      }));
  }

  autoLogin() {
    const userData: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
      const loadedUser = new UserModel(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate));

      if (loadedUser.token) {
        this.user.next(loadedUser);
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        // should call autoLogout function
        this.autoLogout(expirationDuration);
      }
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);

    // remove the user data from localStorage
    localStorage.removeItem('userData');

    // Verificamos si tenemos un active timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    console.log(expirationDuration);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new UserModel(
      email,
      userId,
      token,
      expirationDate);
    this.user.next(user);

    // should call autoLogout function
    this.autoLogout(expiresIn * 1000);

    // store the user data in localStorage
    localStorage.setItem('userData', JSON.stringify(user));

  }

  private handleError(errorResponse: HttpErrorResponse)  {
    let errorMessage = 'An unknown error occurred!';

    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
    }

    switch (errorResponse.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already.';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}
