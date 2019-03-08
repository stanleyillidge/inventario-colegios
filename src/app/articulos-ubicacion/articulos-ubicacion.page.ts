import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-articulos-ubicacion',
  templateUrl: './articulos-ubicacion.page.html',
  styleUrls: ['./articulos-ubicacion.page.scss'],
})
export class ArticulosUbicacionPage implements OnInit {
  articulos:any=[]
  articulost:any
  articulosKeys:any=[]
  sede;
  ubicacion:any={};
  SubUbicacion:any={};
  titulo;
  constructor(
    public plataforma: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.SubUbicacion['nombre'] = this.route.snapshot.paramMap.get('SubUbicacionNombre')
    this.SubUbicacion['key'] = this.route.snapshot.paramMap.get('SubUbicacionkey')
    this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
    this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
    this.sede = this.route.snapshot.paramMap.get('sede')
    this.titulo = this.sede +' / '+ this.ubicacion['nombre'] +' / '+ this.SubUbicacion.nombre
    let child = 'articulos/'+this.ubicacion.key;
    /* let ubic = [
      'Abanico de pared',
      'Abanico de techo',
      'Aire acondicionado split',
      'Archivador tipo locker',
      'Dispensador de agua',
      'Escritorio',
      'Gabinete aereo modular',
      'Gabinete modular metalico de 2 mts',
      'Kit silla y mesa pequeña con superficie, espaldar plástico con estructura en tubo metalico',
      'Kit silla y mesa pequeña con superficie, espaldar y brazo PLASTICO con estructura en TUBO metalico',
      'Lámpara',
      'Mesa de esrudiante',
      'Mesa de MADERA de CUATRO puestos PEQUEÑA',
      'Mesa PEQUEÑA con superficie PLASTICA y estructura en TUBO metalico',
      'Mesa PEQUEÑA en forma de ROMBO con superficie en MADERA y estructura en TUBO metalico',
      'Mesa plastica de cuatro (4) puestos',
      'Mesa plastica de seis (6) puestos',
      'Mesa PLASTICA PEQUEÑA',
      'Pupitre con espaldar y brazo en MADERA, con estructura en ANGULO metalico',
      'Pupitre con espaldar y brazo PLASTICO, con estructura en TUBO metalico',
      'Silla ACOLCHADA en CUERO con estructura de MADERA',
      'Silla ACOLCHADA en TELA con estructura de TUBO metalico',
      'Silla con espaldar PLASTICO y con estructura en TUBO metalico',
      'Silla en MADERA sin descansa brazos',
      'Silla PEQUEÑA con espaldar y brazo PLASTICO y estructura en TUBO metalico',
      'Silla PEQUEÑA sin brazo, con espaldar en MADERA y estructura en TUBO metalico',
      'Silla plastica con descansa brazo',
      'Silla PLASTICA PEQUEÑA sin descansa brazo',
      'Silla plastica sin descansa brazo',
      'Stand de madera',
      'Stand metálico ',
      'Tablero',
      'TV'
    ]
    for(let i in ubic){
      firebase.database().ref(child).push({
        nombre: ubic[i]
      });
    } */
    firebase.database().ref(child).on('value', function(articulosnapshot) {
      este.articulos = []
      let art = {}
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        // art['nombre'] = articulo.val();
        // art['key'] = articulo.key;
        este.articulos.push(articulo.val())
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
            firebase.database().ref('articulos/'+this.ubicacion+'/'+este.articulosKeys[index]+'/nombre').set(d.articulo)
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
            firebase.database().ref('articulos/'+this.ubicacion).push({
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
      message: 'Se <strong>eliminará</strong> la articulo '+articulo+' !!!',
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
            let index = this.articulos.indexOf(articulo)
            firebase.database().ref('articulos/'+this.ubicacion+'/'+este.articulosKeys[index]).remove()
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
