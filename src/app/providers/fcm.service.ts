import { Injectable } from '@angular/core';
// import { Firebase } from '@ionic-native/firebase/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token;

  constructor(
    private toastController: ToastController,
    // public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform
  ) { 
  }
  // Get permission from the user
  async getToken() {

    let token;
    // let plataforma =['ipad' , 'iphone' , 'ios' , 'android' , 'phablet' , 'tablet' , 'cordova' , 'capacitor' , 'electron' , 'pwa' , 'mobile' , 'desktop' , 'hybrid']
    // for(let i in plataforma){
    //   if(this.platform.is(plataforma[i])){
    //     console.log('platforma',plataforma[i],':',this.platform.is(plataforma[i]))
    //   }
    // }
    // console.log('platform android:',this.platform.is('android'))
    // console.log('platform cordova:',this.platform.is('cordova'))
  
    if (this.platform.is('android')) {
      // token = await this.firebaseNative.getToken()
    } 
  
    if (this.platform.is('ios')) {
      // token = await this.firebaseNative.getToken();
      // await this.firebaseNative.grantPermission();
    }

    if(!this.platform.is('desktop')) {
      // this.firebaseNative.subscribe('all');
    }
    return this.saveTokenToFirestore(token)
  }

  // Save the token to firestore
  private saveTokenToFirestore(token) {
    if (!token) return;
  
    // const devicesRef = firebase.database().ref('devices'); //this.afs.collection('devices')
    const TokenUser = JSON.parse(localStorage.getItem('TokenUser'));
  
    const docData = { 
      token: token,
      fechaFCMToken: new Date()
    }
  
    return firebase.database().ref('usuarios').child(TokenUser.claims.user_id).update(docData)
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
    // return this.firebaseNative.onNotificationOpen()
  }
}
