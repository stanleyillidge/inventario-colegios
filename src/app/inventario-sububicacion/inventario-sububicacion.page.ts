import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Http } from '@angular/http';

@Component({
  selector: 'app-inventario-sububicacion',
  templateUrl: './inventario-sububicacion.page.html',
  styleUrls: ['./inventario-sububicacion.page.scss'],
})
export class InventarioSububicacionPage implements OnInit {
  articulos:any=[]
  articulost:any
  sede:any={};
  ubicacion:any={};
  SubUbicacion:any={};
  titulo;
  inventario:any={};
  listat:any = false;
  resument:any = true;
  listaR:any = false;
  articulosR:any;
  articulosRtemp:any;
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
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    // this.titulo
    este.inventario['numArticulos'] = 0;
    este.inventario['buenos'] = 0;
    este.inventario['malos'] = 0;
    este.inventario['regulares'] = 0;
    firebase.database().ref('inventario/'+this.SubUbicacion.key).on('value', function(articulosnapshot) {
      este.articulos = []
      let art = {}
      este.inventario['numArticulos'] = articulosnapshot.numChildren();
      firebase.database().ref('subUbicaciones/'+este.ubicacion.key).child(este.SubUbicacion.key+'/cantidad').set(articulosnapshot.numChildren())
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      let artUnicos = este.articulos.map(item => item.nombre).filter((value, index, self) => self.indexOf(value) === index)
      // console.log(artUnicos);
      este.inventario['articulos unicos'] = [];
      este.inventario['articulos'] = este.articulos;
      for(let art in artUnicos){
        este.inventario['articulos unicos'][art] = {
          nombre: artUnicos[art],
          cantidad:0,
          bueno:0,
          malo:0,
          regular:0
        }
        este.inventario['articulos unicos'][art].articulos = [];
        for(let i in este.articulos){
          if(este.articulos[i].nombre == artUnicos[art]){
            este.inventario['articulos unicos'][art]['cantidad'] += 1;
            este.inventario['articulos unicos'][art].articulos.push(este.articulos[i])
            switch (este.articulos[i].estado) {
              case 'Bueno':
                este.inventario['articulos unicos'][art]['bueno'] += 1
                break;
              case 'Regular':
                este.inventario['articulos unicos'][art]['regular'] += 1
                break;
              case 'Malo':
                este.inventario['articulos unicos'][art]['malo'] += 1
                break;
              default:
                break;
            }
          }
        }
      }
      este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
      console.log(este.inventario['articulos unicos'])
      este.articulost = este.articulos;
    });
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
      este.inventario['buenos'] = BuenoSnapshot.numChildren();
      // console.log('b',este.inventario)
    });
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
      este.inventario['malos'] = MaloSnapshot.numChildren();
      // console.log('m',este.inventario)
    });
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
      este.inventario['regulares'] = RegularSnapshot.numChildren();
      // console.log('r',este.inventario)
    });
  }
  descarga(){
    // https://inventario-denzil-escolar.firebaseio.com/.json
    window.open('https://inventario-denzil-escolar.firebaseio.com/inventario/'+this.SubUbicacion.key+'.json');
  }
  resumen(){
    this.resument = true
    this.listat = false
    this.listaR = false
  }
  lista(){
    this.resument = false
    this.listat = true
    this.listaR = false
  }
  openArt(articulo){
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = articulo.articulos
    this.articulosRtemp = articulo.articulos
  }
  total(){
    let este = this
    firebase.database().ref('inventario/'+this.SubUbicacion.key).on('value', function(articulosnapshot) {
      este.articulos = []
      let art = {}
      este.inventario['numArticulos'] = articulosnapshot.numChildren();
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    });
  }
  Buenos(){
    let este = this
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Bueno').once('value', function(BuenoSnapshot) {
      este.inventario['buenos'] = BuenoSnapshot.numChildren();
      este.articulos = []
      let art = {}
      BuenoSnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    });
  }
  Malos(){
    let este = this
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Malo').once('value', function(MaloSnapshot) {
      este.inventario['malos'] = MaloSnapshot.numChildren();
      este.articulos = []
      let art = {}
      MaloSnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    });
  }
  Regular(){
    let este = this
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Regular').once('value', function(RegularSnapshot) {
      este.inventario['regulares'] = RegularSnapshot.numChildren();
      este.articulos = []
      let art = {}
      RegularSnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    });
  }
  ingresoNuevo(){
    console.log(this.sede,this.ubicacion,this.SubUbicacion)
    this.navCtrl.navigateForward(['articulo-ingreso',{ 
      SubUbicacionNombre: this.SubUbicacion.nombre,
      SubUbicacionkey: this.SubUbicacion.key,
      ubicacionNombre: this.ubicacion.nombre,
      ubicacionkey: this.ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
    }]);
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.articulos = this.articulost;
    this.inventario['articulos unicos'] = this.inventario['articulos unicos temp'];
    this.articulosR = this.articulosRtemp;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      if(this.listat){
        this.articulos = this.articulos.filter((ubicacion) => {
          return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }else if(this.resument){
        this.inventario['articulos unicos'] = this.inventario['articulos unicos'].filter((ubicacion) => {
          return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }else if(this.listaR){
        this.articulosR = this.articulosR.filter((ubicacion) => {
          return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
  }
  open(articulo){
    this.navCtrl.navigateForward(['view-articulo',{ 
      articuloNombre: articulo.nombre,
      articulokey: articulo.key,
      SubUbicacionNombre: this.SubUbicacion.nombre,
      SubUbicacionkey: this.SubUbicacion.key,
      ubicacionNombre: this.ubicacion.nombre,
      ubicacionkey: this.ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
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