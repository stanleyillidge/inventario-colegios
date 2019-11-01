import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth-service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(
        public authService: AuthService,
        private router: Router) {

    }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log(route);
        if(this.authService.isLoggedIn !== true) {
          this.router.navigate(['login'])
        }
        return true;
      }
    // boolean {

    //     console.log(route);

    //     let authInfo = {
    //         authenticated: false
    //     };

    //     if (!authInfo.authenticated) {
    //         this.router.navigate(['login']);
    //         return false;
    //     }

    //     return true;

    // }

}