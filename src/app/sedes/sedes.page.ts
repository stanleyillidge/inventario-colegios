import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit {
  sedes:any=[]
  sedest:any
  sedesKeys:any=[]
  constructor(
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    firebase.database().ref('sedes').on('value', function(sedeSnapshot) {
      este.sedes = []
      sedeSnapshot.forEach(sede => {
        // console.log(sede.val())
        este.sedes.push(sede.val())
        este.sedesKeys.push(sede.key)
      });
      este.sedest = este.sedes;
    });
    // llamado de la cloud function
    // http.get('https://us-central1-pagad-1149c.cloudfunctions.net/test')
    // .subscribe((data) => {
    //   console.log('data', data);
    // })
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.sedes = this.sedest;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.sedes = this.sedes.filter((sede) => {
        return (sede.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  open(sede){
    this.navCtrl.navigateForward(['ubicaciones',{sede:sede}]);
    // this.navCtrl.pop();
  }
  async Editsede(sede) {
    let este = this
    const sedet = sede
    let index = this.sedes.indexOf(sedet)
    const alert = await this.alertController.create({
      header: 'Ediar la sede '+sede+' !',
      inputs: [
        {
          name: 'sede',
          type: 'text',
          value: sede,
          placeholder: 'Nombre de la sede'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edit Cancel');
          }
        }, {
          text: 'Ok',
          handler: (d) => {
            // this.sedes.push(d.sede)
            console.log(index)
            firebase.database().ref('sedes/'+este.sedesKeys[index]).set(d.sede)
            // this.sedes[index]=d.sede
            console.log('Edit Ok',this.sedes);
          }
        }
      ]
    });

    await alert.present();
  }
  async CreateSede() {
    const alert = await this.alertController.create({
      header: 'sede!',
      inputs: [
        {
          name: 'sede',
          type: 'text',
          placeholder: 'Nombre de la sede'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Crear Cancel');
          }
        }, {
          text: 'Ok',
          handler: (d) => {
            firebase.database().ref('sedes').push(d.sede)
            // this.sedes.push(d.sede);
            // this.sedest = this.sedes;
            console.log('Crear Ok',this.sedes);
          }
        }
      ]
    });

    await alert.present();
  }
  async RemoveSede(sede){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la sede '+sede+' !!!',
      buttons: [
        {
          text: 'cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Eliminar Cancel: blah');
          }
        }, {
          text: 'eliminar',
          handler: () => {
            let index = this.sedes.indexOf(sede)
            firebase.database().ref('sedes/'+este.sedesKeys[index]).remove()
            // this.sedes.splice(index, 1);
            // this.sedest = this.sedes;
            console.log('Eliminar Okay');
          }
        }
      ]
    });

    await alert.present();
  }
  ngOnInit() {
  }

}