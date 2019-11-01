import { Component } from '@angular/core';

import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthGuardService } from './auth-guard-service.service';
import { DataService } from './providers/data-service';
import { NetworkProvider } from './providers/network-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    // {
    //   title: 'Resumen',
    //   url: '/home',
    //   icon: 'home'
    // },
    {
      title: 'Inventario',
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
    public guard: AuthGuardService,
    public ds: DataService,
    public networkProvider: NetworkProvider,
    public events: Events,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    let este = this
    this.platform.ready().then(() => {
      this.afAuth.authState.subscribe(user => {
        este.guard.authState = user;
        if (user) {
          este.ds.initDatabase().then(()=>{
            este.networkProvider.initializeNetworkEvents('administrador',user.uid);
            // Offline event
            // este.events.subscribe('network:offline', () => {
            //     alert('network:offline ==> '+este.network.type);    
            // });
            // Online event
            this.events.subscribe('network:online', () => {
              let message = 'network:online'
              este.ds.presentToastWithOptions(message,3000,'top')
            });
            este.splashScreen.hide();
            este.router.navigate(["/sedes"]);
          })
        }else{
          este.splashScreen.hide();
          este.router.navigate(["/login"]);
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
