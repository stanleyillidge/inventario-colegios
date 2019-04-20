import { Component } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController, AlertController, Platform, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(
    private googlePlus: GooglePlus,
    public navCtrl: NavController,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router,
    private platform: Platform,
    public alertController: AlertController,
    public afAuth: AngularFireAuth
  ) { }

  async SignIn(email, password) {
    const loading = await this.loadingController.create({
        // duration: 1500,
        spinner:"circles",//"lines",//"dots",//"bubbles",
        // showBackdrop:false,
        message: 'Autenticando...',
        translucent: true
      });
      await loading.present();
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then((result) => {
        // this.SetUserData(result.user);
        loading.dismiss();
        console.log(email,password)
        this.navCtrl.navigateForward(['sedes'])
    }).catch(async (error) => {
        // window.alert(error.message)
        loading.dismiss();
        const alert = await this.alertController.create({
          message: error.message,
          buttons: ['OK']
        });
   
       await alert.present();
    })
  }
  async doGoogleLogin(){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    this.googlePlus.login({
      'scopes': '', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
      'webClientId': environment.googleWebClientId, // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
      'offline': true, // Optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
    })
    .then(user => {
      //save user data on the native storage
      this.nativeStorage.setItem('google_user', {
        name: user.displayName,
        email: user.email,
        picture: user.imageUrl
      })
      .then(() => {
        //  this.router.navigate(["/home"]);
        console.log('Fue autenticado')
        this.navCtrl.navigateForward(['home'])
      }, (error) => {
        console.log('error 2:',error);
      })
      loading.dismiss();
    }, err => {
      console.log('Error 1',err);
      if(!this.platform.is('cordova')){
        this.presentAlert();
      }
      loading.dismiss();
    })
  }

  async presentAlert() {
    const alert = await this.alertController.create({
       message: 'Cordova is not available on desktop. Please try this in a real device or in an emulator.',
       buttons: ['OK']
     });

    await alert.present();
  }


  async presentLoading(loading) {
    return await loading.present();
  }

}