import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-edita-path',
  templateUrl: './edita-path.page.html',
  styleUrls: ['./edita-path.page.scss'],
})
export class EditaPathPage implements OnInit {
  articulos:any=[]
  articulost:any
  articulosKeys:any=[]
  sede:any=[];
  ubicacion:any={};
  SubUbicacion:any={};
  titulo;
  OldArticulo: any = {};
  ingreso: any = {};
  key: string;
  constructor(
    public plataforma: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.key = this.route.snapshot.paramMap.get('articulokey');
    this.ingreso = JSON.parse(localStorage.getItem('ingreso'))
    console.log('ingreso',this.ingreso)
    firebase.database().ref('articulos').on('value', function(articulosnapshot) {
      console.log('Entro en articulo-ubicacion a: firebase.database().ref(articulos)')
      este.articulos = []
      let art = {}
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
        este.articulosKeys.push(articulo.key)
      });
      este.articulost = este.articulos;
    });
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
        return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  open(articulo){
    console.log(articulo)
    // this.navCtrl.navigateForward(['view-articulo']);
    this.navCtrl.navigateForward(['view-articulo',{
      articulokey: this.key,
      articulo: articulo.key
    }]);
  }
  async Editarticulo(articulo) {
    let este = this
    const articulot = articulo
    let index = this.articulos.indexOf(articulot)
    const alert = await this.alertController.create({
      header: 'Ediar la articulo '+articulo.nombre+' !',
      inputs: [
        {
          name: 'articulo',
          type: 'text',
          value: articulo.nombre,
          placeholder: 'Nombre de la articulo'
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
            // this.articulos.push(d.articulo)
            console.log(index)
            firebase.database().ref('articulos'+articulo.key+'/nombre').set(d.articulo)
            // this.articulos[index]=d.articulo
            console.log('Edit Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  }
  async Createarticulo() {
    const alert = await this.alertController.create({
      header: 'articulo!',
      inputs: [
        {
          name: 'articulo',
          type: 'text',
          placeholder: 'Nombre de la articulo'
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
            firebase.database().ref('articulos').push({
              nombre: d.articulo,
              cantidad: 0
            })
            // this.articulos.push(d.articulo);
            // this.articulost = this.articulos;
            console.log('Crear Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  }
  async Removearticulo(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la articulo '+articulo.nombre+' !!!',
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
            firebase.database().ref('articulos/'+articulo.key).remove()
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