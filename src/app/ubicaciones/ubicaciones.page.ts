import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
})
export class UbicacionesPage implements OnInit {
  ubicaciones:any=[]
  ubicacionest:any
  sede:any=[];
  cantidad:any;
  contador:any={};
  constructor(
    public route: ActivatedRoute,
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    /* let ubic = [
      'Aulas de audiovisuales',
      'Aulas de clases',
      'Aulas de informática',
      'Aulas de música',
      'Aulas de tecnología',
      'Aulas múltiples',
      'Bibliotecas',
      'Centros de ayudas educativas',
      'Corredores y los espacios de circulación',
      'Laboratorios de Biología',
      'Laboratorios de Física',
      'Laboratorios de Química',
      'Laboratorios integrados',
      'Lugares en los cuales es posible practicar deportes en forma individual, o colectiva',
      'Lugares que permiten desarrollar actividades informales de extensión',
      'Oficinas',
      'Taller de cerámica, escultura y modelado',
      'Taller de dibujo técnico y/o artístico'
    ]
    for(let i in ubic){
      firebase.database().ref('ubicaciones/'+this.sede.key).push({
        nombre: ubic[i],
        cantidad:0
      });
    } */
    firebase.database().ref('ubicaciones/'+this.sede.key).on('value', function(ubicacionesnapshot) {
      este.ubicaciones = []
      let ubi = {}
      este.cantidad = ubicacionesnapshot.numChildren();
      ubicacionesnapshot.forEach(ubicacion => {
        // console.log(ubicacion.val())
        ubi = ubicacion.val();
        ubi['key'] = ubicacion.key;
        este.ubicaciones.push(ubi)
      });
      este.ubicacionest = este.ubicaciones;
      este.contador['SubUbicacion'] = 0;
      este.contador['ubicacion'] = 0;
      este.contador['sede'] = 0;
      // este.contador['SubUbicacion'] = articulosnapshot.numChildren();
      // firebase.database().ref('subUbicaciones/'+este.ubicacion.key+'/'+este.SubUbicacion.key+'/cantidad').set(articulosnapshot.numChildren())
      // firebase.database().ref('subUbicaciones/'+este.ubicacion.key).once('value', (SubUbicacioneSnapshot)=>{
      //   SubUbicacioneSnapshot.forEach(SububicacionSnap =>{
      //     este.contador['ubicacion'] += SububicacionSnap.val().cantidad
      //   })
      //   firebase.database().ref('ubicaciones/'+este.sede.key+'/'+este.ubicacion.key+'/cantidad').set(este.contador['ubicacion'])
        firebase.database().ref('ubicaciones/'+este.sede.key).once('value', (UbicacioneSnapshot)=>{
          UbicacioneSnapshot.forEach(ubicacionSnap =>{
            este.contador['sede'] += ubicacionSnap.val().cantidad
          })
          firebase.database().ref('sedes/'+este.sede.key+'/cantidad').set(este.contador['sede'])
        })
      // })
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.ubicaciones = this.ubicacionest;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.ubicaciones = this.ubicaciones.filter((ubicacion) => {
        return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  open(ubicacion:any){
    console.log(this.sede,ubicacion)
    this.navCtrl.navigateForward(['sub-ubicaciones',{ 
      ubicacionNombre:ubicacion.nombre,
      ubicacionkey:ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
    }]);
  }
  async Editubicacion(ubicacion:any) {
    let este = this
    const ubicaciont = ubicacion
    let index = this.ubicaciones.indexOf(ubicaciont)
    const alert = await this.alertController.create({
      header: 'Ediar la ubicacion '+ubicacion.nombre+' !',
      inputs: [
        {
          name: 'ubicacion',
          type: 'text',
          value: ubicacion.nombre,
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
          handler:async (d) => {
            // this.ubicaciones.push(d.ubicacion)
            console.log(index)
            // firebase.database().ref('ubicaciones/'+este.sede.key+'/'+ubicacion.key+'/nombre').set(d.ubicacion)
            let Editubicaciones = firebase.functions().httpsCallable("Editubicaciones");
            let data = {
              sedekey: este.sede.key,
              ubicacionkey: ubicacion.key,
              ubicacion: d.ubicacion
            }
            await Editubicaciones(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo editado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Archivo editado error: ',error);
            })
          }
        }
      ]
    });
    alert.present();
    return
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
          handler:async (d) => {
            // firebase.database().ref('ubicaciones/'+this.sede.key).push({
            //   nombre: d.ubicacion
            // });
            let Createubicaciones = firebase.functions().httpsCallable("Createubicaciones");
            let data = {
              sedekey: this.sede.key,
              ubicacion: d.ubicacion
            }
            await Createubicaciones(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo editado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Archivo editado error: ',error);
            })
          }
        }
      ]
    });
    alert.present();
    return
  }
  async Removeubicacion(ubicacion:any){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la ubicacion '+ubicacion.nombre+' !!!',
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
            // firebase.database().ref('ubicaciones/'+este.sede.key+'/'+ubicacion.key).remove()
            let Removeubicaciones = firebase.functions().httpsCallable("Removeubicaciones");
            let data = {
              sedekey: este.sede.key,
              ubicacionkey: ubicacion.key
            }
            await Removeubicaciones(data).then(function(reponse) {
              // Read result of the Cloud Function.
              console.log('Archivo editado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              console.log('Archivo editado error: ',error);
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
