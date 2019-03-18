import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit {
  sedes:any=[]
  sedest:any
  cantidad: number;
  contador: any = {};
  constructor(
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    /* let sedesf = [
      {nombre:'Mega', cantidad: 0},
      {nombre:'Dividivi', cantidad: 0},
      {nombre:'Taguaira', cantidad: 0},
      {nombre:'Brisas del mar', cantidad: 0},
      {nombre:'Guayacanal', cantidad: 0},
      {nombre:'PreEscolar - Mega', cantidad: 0}
    ];
    for(let i in sedesf){
      firebase.database().ref('sedes').push(sedesf[i]);
    } */
    firebase.database().ref('sedes').on('value', function(sedeSnapshot) {
      este.sedes = []
      let sed = {}
      este.cantidad = sedeSnapshot.numChildren();
      este.contador['sede'] = 0;
      sedeSnapshot.forEach(sede => {
        // console.log(sede.val())
        sed = sede.val();
        sed['key'] = sede.key;
        este.contador['sede'] += sede.val().cantidad
        este.sedes.push(sed)
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
  open(sede:any){
    this.navCtrl.navigateForward(['ubicaciones',{
      sedeNombre:sede.nombre,
      sedekey:sede.key
    }]);
    // this.navCtrl.pop();
  }
  async Editsede(sede:any) {
    let este = this
    const sedet = sede
    let index = this.sedes.indexOf(sedet)
    const alert = await this.alertController.create({
      header: 'Ediar la sede '+sede.nombre+' !',
      inputs: [
        {
          name: 'sede',
          type: 'text',
          value: sede.nombre,
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
          handler:async (d) => {
            // this.sedes.push(d.sede)
            console.log(index)
            // firebase.database().ref('sedes/'+sede.key+'/nombre').set(d.sede)
            let Editsedes = firebase.functions().httpsCallable("Editsedes");
            let data = {
              sede: d.sede,
              key: sede.key
            }
            await Editsedes(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo eliminado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Archivo eliminado error: ',error);
            })
          }
        }
      ]
    });
    alert.present();
    return
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
          handler:async (d) => {
            // firebase.database().ref('sedes').push({
            //   nombre: d.sede,
            //   cantidad: 0
            // })
            let CreateSedes = firebase.functions().httpsCallable("CreateSedes");
            let data = {
              sede: d.sede,
              key: 'sedes'
            }
            await CreateSedes(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo creado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Error en crear Archivo: ',error);
            })
          }
        }
      ]
    });
    alert.present();
    return
  }
  async RemoveSede(sede:any){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la sede '+sede.nombre+' !!!',
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
          handler:async () => {
            // let index = this.sedes.indexOf(sede)
            // firebase.database().ref('sedes/'+sede.key).remove()
            let RemoveSedes = firebase.functions().httpsCallable("RemoveSedes");
            let data = {
              sede: sede.nombre,
              key: sede.key
            }
            await RemoveSedes(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo eliminado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Archivo eliminado error: ',error);
            })
          }
        }
      ]
    });
    alert.present();
    return
  }
  ngOnInit() {
  }

}
