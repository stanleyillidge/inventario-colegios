import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Resumen',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Ingresos',
      url: '/sedes',
      icon: 'list'
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
  ) {
    this.initializeApp();
  }

  initializeApp() {
    let este = this
    this.platform.ready().then(() => {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          este.router.navigate(["/home"]);
          este.splashScreen.hide();
        }else{
          este.router.navigate(["/login"]);
          este.splashScreen.hide();
        }
      })
      this.statusBar.styleDefault();
    });
  }
}
