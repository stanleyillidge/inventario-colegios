import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController } from '@ionic/angular';
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
  contadorTotal:any;
  constructor(
    public plataforma: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private http: Http
  ) {
    let este = this
    /* let ubic = [
      'Abanico de pared',
      'Abanico de techo',
      'Aire acondicionado split',
      'Archivador tipo locker',
      'Atril',
      'Batería sanitaria',
      'Camara de seguridad',
      'Computador de mesa',
      'Computador portátil de computadores para educar',
      'Control remoto para aire acondicionado split',
      'Dispensador de agua',
      'Equipo de Sonido',
      'Escaner',
      'Escritorio',
      'Estufa a gas de DOS puestos tipo industrial',
      'Estufa a gas de DOS puestos tipo industrial con gabinete',
      'Estufa a gas de TRES puestos tipo industrial',
      'Gabinete aereo modular',
      'Gabinete Metálico Aéreo ',
      'Gabinete modular metalico de 2 mts',
      'Kit contra incendio',
      'Kit silla y mesa pequeña con superficie, espaldar PLASTICO con estructura en TUBO metalico',
      'Kit silla y mesa pequeña con superficie, espaldar y brazo PLASTICO con estructura en TUBO metalico',
      'Lámpara',
      'Lámpara Circular',
      'Lampara incandescente de alta potencia ',
      'Lavamanos',
      'Lavaplatos',
      'Mesa de MADERA con BASE metálica',
      'Mesa de MADERA con BASE metálica PEQUEÑA',
      'Mesa de MADERA de CUATRO puestos PEQUEÑA',
      'Mesa de MADERA de ocho puestos con toma ELECTRICO y BASE METÁLICA',
      'Mesa modular con punto eléctrico',
      'Mesa modular doble de color blanco',
      'Mesa PEQUEÑA con superficie PLASTICA y estructura en TUBO metalico',
      'Mesa PEQUEÑA en forma de ROMBO con superficie en MADERA y estructura en TUBO metalico',
      'Mesa plástica color blanco',
      'Mesa plastica de cuatro (4) puestos',
      'Mesa plastica de seis (6) puestos',
      'Mesa PLASTICA PEQUEÑA',
      'Micrófono alambrico',
      'Micrófono inalambrico',
      'Parlante de 60W y 8 ohmios',
      'Probeta',
      'Pupitre con espaldar y brazo en MADERA, con estructura en ANGULO metalico',
      'Pupitre con espaldar y brazo PLASTICO, con estructura en TUBO metalico',
      'Silla ACOLCHADA en CUERO con estructura de MADERA',
      'Silla ACOLCHADA en TELA con estructura de TUBO metalico',
      'Silla con espaldar PLASTICO y con estructura de TUBO metálico',
      'Silla con espaldar PLASTICO y con estructura en TUBO metalico',
      'Silla en MADERA sin descansa brazos',
      'Silla PEQUEÑA con espaldar y brazo PLASTICO y estructura en TUBO metalico',
      'Silla PEQUEÑA sin brazo, con espaldar en MADERA y estructura en TUBO metalico',
      'Silla plastica con descansa brazo',
      'Silla PLASTICA PEQUEÑA sin descansa brazo',
      'Silla plastica sin descansa brazo',
      'Silla plastica sin descansa brazo color AZUL',
      'Silla plastica sin descansa brazo color VERDE',
      'Stand de madera',
      'Stand metálico',
      'Tablero',
      'Tanque de 100 litros',
      'Tanque plástico de 50 litros',
      'Tanque plástico de 75 litros',
      'Teléfono fijo',
      'TV'
    ];
    let tipo = [
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Equipos de comunicación y computación',
      'Equipos de comunicación y computación',
      'Propiedad, planta y equipo',
      'Materiales para prestación de servicios',
      'Propiedad, planta y equipo',
      'Equipos de comunicación y computación',
      'Muebles enseres y equipo de oficina',
      'Equipo de comedor, cocina, despensa y hotelería',
      'Equipo de comedor, cocina, despensa y hotelería',
      'Equipo de comedor, cocina, despensa y hotelería',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Materiales para educación',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Materiales para prestación de servicios',
      'Materiales para prestación de servicios',
      'Materiales para educación',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Propiedad, planta y equipo',
      'Materiales para educación'
    ]
    for(let i in ubic){
      firebase.database().ref('articulos').push({
        nombre: ubic[i],
        cantidad: 0,
        tipo: tipo[i]
      });
    } */

    firebase.database().ref('articulos').on('value', function(articulosnapshot) {
      console.log('Entro en articulo-ubicacion a: firebase.database().ref(articulos)')
      este.articulos = []
      let art = {}
      este.contadorTotal = 0;
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        este.contadorTotal += articulo.val().cantidad
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
            console.log('Edit Cancel',articulo.nombre,articulo.key);
          }
        }, {
          text: 'Ok',
          handler: (d) => {
            // this.articulos.push(d.articulo)
            console.log(index)
            firebase.database().ref('articulos/'+articulo.key+'/nombre').set(d.articulo)
            // this.articulos[index]=d.articulo
            this.actualizaInventario(d.articulo,articulo.nombre)
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
            console.log('Eliminar Okay',articulo.nombre,articulo.key);
          }
        }
      ]
    });

    await alert.present();
  }
  async actualizaInventario(newNombre:any,oldNombre:any){
    const loading = await this.loadingController.create({
      message: 'Actualizando inventario general'
    });
    await loading.present();
    firebase.database().ref('inventario').once('value',async subUbicaciones=>{
      await subUbicaciones.forEach(subUbicacion=>{
        firebase.database().ref('inventario').child(subUbicacion.key).orderByChild("nombre").equalTo(oldNombre).once('value',lista=>{
          lista.forEach(ingreso=>{
            firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
            .child('nombre').set(newNombre)
            firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
            .child('articulo/nombre').set(newNombre)
          })
          // lista.forEach(function wrapper(){async ingreso => {
          //   await firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
          //   .child('nombre').set(newNombre)
          //   await firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
          //   .child('articulo/nombre').set(newNombre)
          // }})
          loading.dismiss()
        })
      })
    });
  }
  ngOnInit() {
  }

}
