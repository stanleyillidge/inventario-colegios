import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
})
export class UbicacionesPage implements OnInit {
  ubicaciones:any=[]
  ubicacionest:any
  ubicacionesKeys:any=[]
  sede;
  constructor(
    public route: ActivatedRoute,
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.sede = this.route.snapshot.paramMap.get('sede')
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
      firebase.database().ref('ubicaciones').push({
        nombre: ubic[i]
      });
    } */
    firebase.database().ref('ubicaciones').on('value', function(ubicacionesnapshot) {
      este.ubicaciones = []
      let ubi = {}
      ubicacionesnapshot.forEach(ubicacion => {
        // console.log(ubicacion.val())
        ubi = ubicacion.val();
        ubi['key'] = ubicacion.key;
        este.ubicaciones.push(ubi)
        este.ubicacionesKeys.push(ubicacion.key)
      });
      este.ubicacionest = este.ubicaciones;
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
  open(ubicacion){
    console.log(this.sede,ubicacion)
    this.navCtrl.navigateForward(['sub-ubicaciones',{ 
      ubicacionNombre:ubicacion.nombre,
      ubicacionkey:ubicacion.key,
      sede: this.sede
    }]);
  }
  async Editubicacion(ubicacion) {
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
          handler: (d) => {
            // this.ubicaciones.push(d.ubicacion)
            console.log(index)
            firebase.database().ref('ubicaciones/'+ubicacion.key+'/nombre').set(d.ubicacion)
            // this.ubicaciones[index]=d.ubicacion
            console.log('Edit Ok',this.ubicaciones);
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
            firebase.database().ref('ubicaciones').push({
              nombre: d.ubicacion
            });
            console.log('Crear Ok',this.ubicaciones);
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
          handler: () => {
            firebase.database().ref('ubicaciones/'+ubicacion.key).remove()
            // this.ubicaciones.splice(index, 1);
            // this.ubicacionest = this.ubicaciones;
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
