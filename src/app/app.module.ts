import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import * as firebase from 'firebase/app';

import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from "@ionic-native/social-sharing/ngx"
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { Camera } from '@ionic-native/camera/ngx';

import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthGuardService } from './auth-guard-service.service';

// export const config = {
//   production: true,
//   firebase: {
//     apiKey: "AIzaSyBRVj7CN2SNw0MpZ09nm9YikAVnIsa-_ZA",
//     authDomain: "inventario-denzil-escolar.firebaseapp.com",
//     databaseURL: "https://inventario-denzil-escolar.firebaseio.com",
//     projectId: "inventario-denzil-escolar",
//     storageBucket: "inventario-denzil-escolar.appspot.com",
//     messagingSenderId: "734631097460"
//   }
// };
// --- Base de Datos de pruebas -------------------------------------
export const config = {
  production: true,
  firebase: {
    apiKey: "AIzaSyDjGDQWprrwXXockp2pJRHTzf4JBBIaS-M",
    authDomain: "inventario-denzil-develop.firebaseapp.com",
    databaseURL: "https://inventario-denzil-develop.firebaseio.com",
    projectId: "inventario-denzil-develop",
    storageBucket: "inventario-denzil-develop.appspot.com",
    messagingSenderId: "600023016657"
  }
};
firebase.initializeApp(config.firebase);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpModule,
    AngularFireModule.initializeApp(config.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BarcodeScanner,
    File,
    SocialSharing,
    ImageResizer,
    Camera,
    GooglePlus,
    NativeStorage,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
