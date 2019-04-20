import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  authState: any = null;

  constructor(private afAuth: AngularFireAuth,private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot): boolean {

      // console.log(this.authState,route);

      let authInfo = {
          authenticated: false
      };

      if (!this.authState) {
          this.router.navigate(['login']);
          return false;
      }

      return true;

  }

}