import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  ubicacion;
  articulos:any=[]
  articulost:any
  articulosKeys:any=[]
  constructor(
    public plataforma: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.ubicacion = this.route.snapshot.paramMap.get('ubicacion')
    firebase.database().ref('articulos').on('value', function(articulosnapshot) {
      este.articulos = []
      articulosnapshot.forEach(ubicacion => {
        // console.log(ubicacion.val())
        este.articulos.push(ubicacion.val())
        este.articulosKeys.push(ubicacion.key)
      });
      este.articulost = este.articulos;
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
    this.articulos = this.articulost;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.articulos = this.articulos.filter((ubicacion) => {
        return (ubicacion.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  openUbicacion(ubicacion){
    console.log(ubicacion)
    this.navCtrl.navigateForward(['ubicacion',
      {
        ubicacion: ubicacion
      }
    ]);
  }
  async Editubicacion(ubicacion) {
    let este = this
    const ubicaciont = ubicacion
    let index = this.articulos.indexOf(ubicaciont)
    const alert = await this.alertController.create({
      header: 'Ediar la ubicacion '+ubicacion+' !',
      inputs: [
        {
          name: 'ubicacion',
          type: 'text',
          value: ubicacion,
          placeholder: 'Nombre de la ubicacion'
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
            // this.articulos.push(d.ubicacion)
            console.log(index)
            firebase.database().ref('articulos/'+este.articulosKeys[index]).set(d.ubicacion)
            // this.articulos[index]=d.ubicacion
            console.log('Edit Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  }
  async Createubicacion() {
    const alert = await this.alertController.create({
      header: 'ubicacion!',
      inputs: [
        {
          name: 'ubicacion',
          type: 'text',
          placeholder: 'Nombre de la ubicacion'
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
            firebase.database().ref('articulos').push(d.ubicacion)
            // this.articulos.push(d.ubicacion);
            // this.articulost = this.articulos;
            console.log('Crear Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  }
  async Removeubicacion(ubicacion){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la ubicacion '+ubicacion+' !!!',
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
            let index = this.articulos.indexOf(ubicacion)
            firebase.database().ref('articulos/'+este.articulosKeys[index]).remove()
            // this.articulos.splice(index, 1);
            // this.articulost = this.articulos;
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
