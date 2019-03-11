import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-sub-ubicaciones',
  templateUrl: './sub-ubicaciones.page.html',
  styleUrls: ['./sub-ubicaciones.page.scss'],
})
export class SubUbicacionesPage implements OnInit {
  subUbicaciones:any=[]
  subUbicacionest:any
  subUbicacionesKeys:any=[]
  titulo;
  ubicacion:any={};
  sede:any=[];
  cantidad: number;
  constructor(
    public route: ActivatedRoute,
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http
  ) {
    let este = this
    this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
    this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    this.titulo = this.sede.nombre +' / '+ this.ubicacion.nombre
    console.log(this.ubicacion)
    console.log(this.sede)
    /* let ubic = [
      'Sala de maestros',
      'Aula - 001',
      'Aula - 002',
      'Cocina',
      'Aula - 003',
      'Aula - 004',
      'Aula - 005',
      'Aula - 006',
      'Aula - 007',
      'Aula - 008',
      'Aula - 009',
      'Aula - 010',
      'Aula - 011',
      'Aula - 012',
      'Aula - 013',
      'Aula - 014',
      'Aula - 015',
      'Aula - 016',
      'Aula - 017',
      'Aula - 018',
      'Aula - 019',
      'Aula - 020',
      'Aula - 021',
      'Aula - 022',
      'Aula - 023',
      'Aula - 024',
      'Aula - 025'
    ]
    for(let i in ubic){
      firebase.database().ref('subUbicaciones/'+this.ubicacion.key).push({
        nombre: ubic[i],
        cantidad: 0
      });
    } */
    firebase.database().ref('subUbicaciones/'+this.ubicacion.key).on('value', function(subUbicacionesnapshot) {
      este.subUbicaciones = []
      let ubi = {}
      este.cantidad = subUbicacionesnapshot.numChildren();
      subUbicacionesnapshot.forEach(Sububicacion => {
        // console.log(Sububicacion.val())
        ubi = Sububicacion.val();
        ubi['key'] = Sububicacion.key;
        este.subUbicaciones.push(ubi);
      });
      este.subUbicacionest = este.subUbicaciones;
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.subUbicaciones = this.subUbicacionest;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.subUbicaciones = this.subUbicaciones.filter((articulo) => {
        return (articulo.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  open(SubUbicacion){
    console.log(this.sede,this.ubicacion,SubUbicacion)
    this.navCtrl.navigateForward(['inventario-sububicacion',{ 
      SubUbicacionNombre: SubUbicacion.nombre,
      SubUbicacionkey: SubUbicacion.key,
      ubicacionNombre: this.ubicacion.nombre,
      ubicacionkey: this.ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
    }]);
  }
  async EditSububicacion(articulo) {
    let este = this
    const articulot = articulo
    let index = this.subUbicaciones.indexOf(articulot)
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
            // this.subUbicaciones.push(d.articulo)
            console.log(index)
            firebase.database().ref('subUbicaciones/'+this.ubicacion.key+'/'+articulo.key+'/nombre').set(d.articulo)
            // this.subUbicaciones[index]=d.articulo
            console.log('Edit Ok',this.subUbicaciones);
          }
        }
      ]
    });

    await alert.present();
  }
  async CreateSububicacion() {
    const alert = await this.alertController.create({
      header: 'subUbicacion!',
      inputs: [
        {
          name: 'subUbicacion',
          type: 'text',
          placeholder: 'Nombre de la subUbicacion'
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
            firebase.database().ref('subUbicaciones/'+this.ubicacion.key).push({
              nombre: d.subUbicacion
            });
            console.log('Crear Ok',this.subUbicaciones);
          }
        }
      ]
    });

    await alert.present();
  }
  async RemoveSububicacion(articulo){
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
            firebase.database().ref('subUbicaciones/'+this.ubicacion.key+'/'+articulo.key).remove()
            // this.subUbicaciones.splice(index, 1);
            // this.subUbicacionest = this.subUbicaciones;
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