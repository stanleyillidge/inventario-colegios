import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthGuardService } from './auth-guard-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    // {
    //   title: 'Resumen',
    //   url: '/home',
    //   icon: 'home'
    // },
    {
      title: 'Resumen',
      url: '/sedes',
      icon: 'home'
    },
    {
      title: 'Articulos',
      url: '/articulos-ubicacion',
      icon: 'list'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nativeStorage: NativeStorage,
    private router: Router,
    public afAuth: AngularFireAuth,
    public guard: AuthGuardService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    let este = this
    this.platform.ready().then(() => {
      this.afAuth.authState.subscribe(user => {
        este.guard.authState = user;
        if (user) {
          este.router.navigate(["/sedes"]);
          este.splashScreen.hide();
        }else{
          este.router.navigate(["/login"]);
          este.splashScreen.hide();
        }
      })
      this.statusBar.styleDefault();
    });
  }
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
    localStorage.removeItem('user');
        this.router.navigate(['']);
    })
}
}
