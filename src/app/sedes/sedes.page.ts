import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit {
  sede:any = {};
  ubicacion:any = {};
  subUbicacion:any = {};
  sedes:any=[]
  sedest:any
  cantidad: number;
  contador: any = {};
  inventario: any = {};
  nombresArt: any;
  listat:any = true;
  resument:any = false;
  listaR:any = false;
  articulos: any;
  articulost: any;
  articulosR: any[];
  articulosRtemp: any[];
  articulosX: any = {};
  sheetData: any = {};
  pregunta:any = false;
  actaBaja: any;
  tituloAlertas:string = 'Inventarios Denzil Escolar!';
  etiqueta: any[];
  constructor(
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
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
      console.log('Entro en sedes a: firebase.database().ref(sedes)')
      este.sedes = []
      let sed = {}
      este.sede = sedeSnapshot.val();
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
    firebase.database().ref('ubicaciones').on('value',ubicacionesSnap=>{
      console.log('Entro en sedes a: firebase.database().ref(ubicaciones)')
      este.ubicacion = ubicacionesSnap.val();
    })
    firebase.database().ref('subUbicaciones').on('value',subUbicacionSnap=>{
      console.log('Entro en sedes a: firebase.database().ref(subUbicaciones)')
      este.subUbicacion = subUbicacionSnap.val();
    })
    firebase.database().ref('articulos').on('value',articulosSnapX=>{
      console.log('Entro en sedes a: firebase.database().ref(articulos)')
      este.articulosX['existen'] = {}
      este.articulosX['no existen'] = []
      este.articulosX['existen'] = articulosSnapX.val();
    })
    // firebase.database().ref('articulos').on('value',articulos=>{
    //   este.nombresArt = articulos.val();
    //   este.cargaDataVistaFontral()
    // })
  }
  cargaDataVistaFontral(){
    let este = this;
    let inventarioRef = firebase.database().ref('inventario')
    este.inventario['articulos'] = {};
    este.inventario['articulos']['total'] = {cantidad:0,articulosObj:{},articulosArray:[]};
    este.inventario['articulos']['buenos'] = {cantidad:0,articulosObj:{},articulosArray:[]};
    este.inventario['articulos']['malos'] = {cantidad:0,articulosObj:{},articulosArray:[]};
    este.inventario['articulos']['regulares'] = {cantidad:0,articulosObj:{},articulosArray:[]};
    let carga = async function(subUbicaciones:any) {
      console.log('Entro en sedes')
      let ubi = {};
      await subUbicaciones.forEach(subUbicacion => {
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
          console.log('Entro en sedes')
          este.inventario['articulos']['buenos']['cantidad'] += BuenoSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += BuenoSnapshot.numChildren();
          este.inventario['articulos']['buenos']['articulosObj'] = Object.assign(este.inventario['articulos']['buenos']['articulosObj'], BuenoSnapshot.val());
          // este.inventario['articulos']['total']['articulosObj'] = Object.assign(este.inventario['articulos']['total']['articulosObj'], BuenoSnapshot.val());
          BuenoSnapshot.forEach(data=>{
            let artdata = {};
            artdata = data.val();
            artdata['key'] = data.key
            este.inventario['articulos']['buenos']['articulosArray'].push(artdata)            
          })
          // console.log('b',este.inventario)
        });
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
          console.log('Entro en sedes')
          este.inventario['articulos']['malos']['cantidad'] += MaloSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += MaloSnapshot.numChildren();
          este.inventario['articulos']['malos']['articulosObj'] = Object.assign(este.inventario['articulos']['malos']['articulosObj'], MaloSnapshot.val());
          MaloSnapshot.forEach(data=>{
            let artdata = {};
            artdata = data.val();
            artdata['key'] = data.key
            este.inventario['articulos']['malos']['articulosArray'].push(artdata)            
          })
          // console.log('m',este.inventario)
        });
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
          console.log('Entro en sedes')
          este.inventario['articulos']['regulares']['cantidad'] += RegularSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += RegularSnapshot.numChildren();
          este.inventario['articulos']['regulares']['articulosObj'] = Object.assign(este.inventario['articulos']['regulares']['articulosObj'], RegularSnapshot.val());
          RegularSnapshot.forEach(data=>{
            let artdata = {};
            artdata = data.val();
            artdata['key'] = data.key
            este.inventario['articulos']['regulares']['articulosArray'].push(artdata)            
          })
          // console.log('r',este.inventario)
        });
      })
    }
    inventarioRef.on('value', carga);
    console.log('Inventario: ',este.inventario)
    /* let inventarioRef = firebase.database().ref('inventario/'+this.SubUbicacion.key)
    let carga = function(articulosnapshot) {
      este.articulos = []
      let art = {}
      este.inventario['numArticulos'] = articulosnapshot.numChildren();
      let contador = {}
      contador['SubUbicacion'] = 0;
      contador['ubicacion'] = 0;
      contador['sede'] = 0;
      contador['SubUbicacion'] = articulosnapshot.numChildren();
      firebase.database().ref('subUbicaciones/'+este.ubicacion.key+'/'+este.SubUbicacion.key+'/cantidad').set(articulosnapshot.numChildren())
      firebase.database().ref('subUbicaciones/'+este.ubicacion.key).once('value', (SubUbicacioneSnapshot)=>{
        SubUbicacioneSnapshot.forEach(SububicacionSnap =>{
          contador['ubicacion'] += SububicacionSnap.val().cantidad
        })
        firebase.database().ref('ubicaciones/'+este.sede.key+'/'+este.ubicacion.key+'/cantidad').set(contador['ubicacion'])
        firebase.database().ref('ubicaciones/'+este.sede.key).once('value', (UbicacioneSnapshot)=>{
          UbicacioneSnapshot.forEach(ubicacionSnap =>{
            contador['sede'] += ubicacionSnap.val().cantidad
          })
          firebase.database().ref('sedes/'+este.sede.key+'/cantidad').set(contador['sede'])
        })
      })
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
        if(art['nombre'] != este.nombresArt[art['articulo'].key].nombre){
          console.log('El nombre no es igual')
          inventarioRef.off('value', carga)
          firebase.database().ref('inventario').child(este.SubUbicacion.key)
          .child(articulo.key).child('nombre').set(este.nombresArt[art['articulo'].key].nombre)
          .then(x=>{
            inventarioRef.on('value', carga)
          })
        }
        // art['nombre'] = este.nombresArt[art['articulo'].key].nombre
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
            este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
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
      este.inventario['articulos unicos']['sede'] = este.sede
      este.inventario['articulos unicos']['ubicacion'] = este.ubicacion
      este.inventario['articulos unicos']['SubUbicacion'] = este.SubUbicacion
      firebase.database().ref('resumenes').child(este.SubUbicacion.key).set(este.inventario['articulos unicos'])
      este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
      console.log('articulos unicos: ',este.inventario['articulos unicos'])
      este.articulost = este.articulos;
    }
    inventarioRef.on('value', carga); */
  }
  async resumen2(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    if(!este.articulos){
      const loading = await this.loadingController.create({
        message: 'Creando vista'
      });
      await loading.present();
      firebase.database().ref('inventario').once('value',articulosSnap=>{
        este.articulos = [];
        este.contador.sede = 0;
        articulosSnap.forEach(articulo => {
          // console.log(articulo.val())
          este.contador.sede += 1;
          let art = articulo.val();
          art['key'] = articulo.key;
          art['sede'] = este.sede[articulo.val().sede]
          art['ubicacion'] = este.ubicacion[articulo.val().ubicacion]
          art['subUbicacion'] = este.subUbicacion[articulo.val().subUbicacion]
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
              este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
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
        // este.inventario['articulos unicos']['sede'] = este.sede
        // este.inventario['articulos unicos']['ubicacion'] = este.ubicacion
        // este.inventario['articulos unicos']['SubUbicacion'] = este.SubUbicacion
        // firebase.database().ref('resumenes').child(este.SubUbicacion.key).set(este.inventario['articulos unicos'])
        este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
        console.log('articulos unicos: ',este.inventario['articulos unicos'])
        este.articulost = este.articulos;
      }).then(r=>{
        loading.dismiss()
      })
    }
  }
  async resumen(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    if(!este.articulos){
      for(let i in este.articulosX['existen']){
        este.articulosX['existen'][i].cantidad = 0;
      }
      const loading = await this.loadingController.create({
        message: 'Creando vista de resumen general...'
      });
      await loading.present();
      firebase.database().ref('inventario').once('value',subSnap=>{
        este.articulos = [];
        // este.contador.sede = 0;
        este.inventario['detallado'] = [];
        este.inventario['articulos unicos'] = [];
        subSnap.forEach(articulosSnap=>{
          articulosSnap.forEach(articulo => {
            // console.log(articulo.val())
            if(este.articulosX['existen'][articulo.val().articulo.key]){
              // este.contador.sede += 1;
              este.articulosX['existen'][articulo.val().articulo.key].cantidad += 1;
            }else{
              este.articulosX['no existen'].push(articulo.val())
            }
            let art = articulo.val();
            art['key'] = articulo.key;
            este.articulos.push(art)
            este.inventario['detallado'].push([
              articulo.key,
              articulo.val().articulo.key,
              articulo.val().articulo.nombre,
              articulo.val().sede.nombre,
              articulo.val().ubicacion.nombre,
              articulo.val().subUbicacion.nombre,
              articulo.val().valor,
              articulo.val().disponibilidad,
              articulo.val().estado,
              articulo.val().imagen,
              articulo.val().observaciones,
              articulo.val().descripcion
            ])
          });
          let artUnicos = este.articulos.map(item => item.nombre).filter((value, index, self) => self.indexOf(value) === index)
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
                este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
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
          este.articulost = este.articulos;
        })
      }).then(async r=>{
        firebase.database().ref('articulos').update(este.articulosX['existen']) // actualizo los contadores de articulos
        loading.dismiss()
        const alert = await this.alertController.create({
          header: este.tituloAlertas,
          message: 'Desea <strong>recibir una copia del resumen de su inventario</strong> al correo electronico!!!',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                console.log('Confirm Cancel: no envio el resumen');
                this.pregunta = false;
              }
            }, {
              text: 'Si',
              handler: async () => {
                console.log('Confirm Okay: envio el resumen');
                const loading2 = await this.loadingController.create({
                  message: '...Generando y enviando archivo de resumen al Email...'
                });
                await loading2.present();
                este.sheetData['values'] = [];
                este.sheetData['detallado'] = este.inventario['detallado'];
                este.sheetData['titulo'] = 'General';
                este.sheetData['sheet'] = ['Resumen','Inventario Detallado'];
                este.sheetData['range'] = ['Resumen!A2:E','Inventario Detallado!A2:Z'];
                este.sheetData['spreadsheetId'] = '1588aKnTpo2G9WXWVPOW5S0c319qkvC1GKj4wkbqz-Lw';
                for(let fila in este.inventario['articulos unicos']){
                  // console.log(este.inventario['articulos unicos'][fila])
                  este.sheetData.values.push([
                    este.inventario['articulos unicos'][fila].nombre,
                    este.inventario['articulos unicos'][fila].cantidad,
                    este.inventario['articulos unicos'][fila].bueno,
                    este.inventario['articulos unicos'][fila].malo,
                    este.inventario['articulos unicos'][fila].regular]
                  )
                }
                let exportaFS = firebase.functions().httpsCallable("exportaFS");
                let data = este.sheetData
                exportaFS(data).then(async function(response) {
                  // Read result of the Cloud Function.
                  await console.log('Archivo creado: ',response);
                  este.sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
                  let message = 'El resumen fué enviado al correo electronico'
                  este.presentToastWithOptions(message,3000,'top')
                  loading2.dismiss()
                }).catch(function(error) {
                  // Read result of the Cloud Function.
                  console.log('Error en crear Archivo: ',error);
                })
              }
            }
          ]
        });
        await alert.present();
        console.log('articulos unicos: ',este.inventario['articulos unicos'],este.articulosX,este.sheetData)
      })
    }
  }
  sheet(){
    window.open(this.sheetData.url,'_blank');
  }
  acta(){
    window.open(this.actaBaja.url,'_blank');
  }
  acta2(articulo){
    window.open(articulo.acta,'_blank');
  }
  Etiqueta(articulo){
    window.open(articulo.etiqueta,'_blank');
  }
  lista(){
    this.resument = false
    this.listat = true
    this.listaR = false
  }
  total(articulo){
    let este = this
    /* firebase.database().ref('inventario/'+this.SubUbicacion.key).once('value', function(articulosnapshot) {
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
    }); */
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    for(let i in articulo.articulos){
      este.articulosR.push(articulo.articulos[i])
    }
    console.log('Todos: ',this.articulosR)
  }
  Buenos(articulo){
    let este = this
    /* firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Bueno').once('value', function(BuenoSnapshot) {
      este.inventario['buenos'] = BuenoSnapshot.numChildren();
      este.articulos = []
      let art = {}
      BuenoSnapshot.forEach(articulo => {
        console.log('Buenos: ',articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    }); */
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Bueno"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    console.log('Bueno: ',this.articulosR)
  }
  Malos(articulo){
    let este = this
    /* firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Malo').once('value', function(MaloSnapshot) {
      este.inventario['malos'] = MaloSnapshot.numChildren();
      este.articulos = []
      let art = {}
      MaloSnapshot.forEach(articulo => {
        console.log('Malos: ',articulo.val())
        art = articulo.val();
        art['key'] = articulo.key;
        este.articulos.push(art)
      });
      este.inventario['articulos'] = este.articulos;
      este.articulost = este.articulos;
    }); */
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Malo"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    console.log('Malo: ',this.articulosR)
  }
  Regular(articulo){
    let este = this
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Regular"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    console.log('Regular: ',this.articulosR)
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.sedes = this.sedest;
    this.inventario['articulos unicos'] = this.inventario['articulos unicos temp'];
    this.articulosR = this.articulosRtemp;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      if(this.listat){
        this.sedes = this.sedes.filter((ubicacion) => {
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
  open2(articulo:any){
    this.navCtrl.navigateForward(['view-articulo',{ 
      articuloNombre: articulo.nombre,
      articulokey: articulo.key,
      SubUbicacionNombre: articulo.subUbicacion.nombre,
      SubUbicacionkey: articulo.subUbicacion.key,
      ubicacionNombre: articulo.ubicacion.nombre,
      ubicacionkey: articulo.ubicacion.key,
      sedeNombre: articulo.sede.nombre,
      sedekey: articulo.sede.key
    }]);
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
    this.navCtrl.navigateForward(['crea-locacion',{
      sedeNombre:sede.nombre,
      sedekey:sede.key
    }]);
    /* const sedet = sede
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
    alert.present(); */
    return
  }
  async CreateSede() {
    this.navCtrl.navigateForward(['crea-locacion']);
    /* const alert = await this.alertController.create({
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
    alert.present(); */
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
  RemoveArticulo(articulo){
    let este = this
    firebase.database().ref('subUbicaciones')
    .child(articulo.ubicacion.key).child(articulo.subUbicacion.key).once('value',a0=>{
      let b = a0.val().cantidad - 1;
      firebase.database().ref('subUbicaciones')
      .child(articulo.ubicacion.key).child(articulo.subUbicacion.key).child('cantidad').set(b)
    }).then(ar=>{
      firebase.database().ref('ubicaciones')
      .child(articulo.sede.key).child(articulo.ubicacion.key).once('value',a1=>{
        let b = a1.val().cantidad - 1;
        firebase.database().ref('ubicaciones')
        .child(articulo.sede.key).child(articulo.ubicacion.key).child('cantidad').set(b)
      }).then(a1r=>{
        firebase.database().ref('sedes')
        .child(articulo.sede.key).once('value',a2=>{
          let b = a2.val().cantidad - 1;
          firebase.database().ref('sedes')
          .child(articulo.sede.key).child('cantidad').set(b)
        }).then(a2r=>{
          let index = este.articulos.indexOf(articulo)
          este.articulos.slice(index,1)
          let index2 = este.articulosR.indexOf(articulo)
          este.articulosR.splice(index2,1)
          console.log(este.articulosR, index)
          firebase.database().ref('inventario')
          .child(articulo.subUbicacion.key).child(articulo.key).remove().then(async a3r=>{
              const alert = await this.alertController.create({
                header: 'Articulo eliminado',
                subHeader: 'Confirmación de Eliminación',
                message: 'El articulo '+articulo.nombre+' fue eliminado correctamente',
                buttons: ['OK']
              });
              await alert.present();
          })
        })
      })
    })
  }
  async BajaArticulo(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: este.tituloAlertas,
      message: 'Desea <strong>dar de BAJA el articulo '+articulo.nombre+'</strong>!!!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: no se dará de baja el articulo');
          }
        }, {
          text: 'Si',
          handler: async () => {
            // console.log('Confirm Okay');
            await alert.present();
            const loading2 = await this.loadingController.create({
              message: 'Creando acta de Baja de articulo...'
            });
            await loading2.present();
            let BajaDeArticulo = firebase.functions().httpsCallable("BajaDeArticulo");
            let data = articulo
            data['fecha'] = new Date().toLocaleDateString();
            console.log('data para crear el acta:',data)
            BajaDeArticulo(data).then(async function(response) {
              // Read result of the Cloud Function.
              este.actaBaja=[]
              articulo.disponibilidad = 'No'
              await console.log('Archivo creado: ',response);
              este.actaBaja['url'] = 'https://docs.google.com/document/d/'+response.data.doc.id+'/edit'
              firebase.database().ref('inventario')
              .child(articulo.subUbicacion.key).child(articulo.key)
              .update({
                disponibilidad:'No',
                acta: este.actaBaja['url'],
                actaId:response.data.doc.id,
                fechaBaja: new Date().toLocaleDateString()
              }).then(re=>{
                let message = 'El articulo fue dado de baja'
                este.presentToastWithOptions(message,3000,'top')
                loading2.dismiss()
              })
            }).catch(function(error) {
              // Read result of the Cloud Function.
              loading2.dismiss()
              console.log('Error en crear Archivo: ',error);
              let message = 'Error en crear Archivo: '+error
              este.presentToastWithOptions(message,3000,'top')
            })
          }
        }
      ]
    });
    await alert.present();
  }
  async creaEtiqueta(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: este.tituloAlertas,
      message: 'Desea <strong>crear una nueva etiqueta para el articulo '+articulo.nombre+'</strong>!!!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: no se creara una nueva etiqueta para el articulo');
          }
        }, {
          text: 'Si',
          handler: async () => {
            // console.log('Confirm Okay');
            await alert.present();
            const loading2 = await this.loadingController.create({
              message: 'Creando acta de Baja de articulo...'
            });
            await loading2.present();
            let createLabels = firebase.functions().httpsCallable("createLabels");
            let data = articulo
            data['fecha'] = new Date().toLocaleDateString();
            // {imagen: data.imagen, fecha: data.fecha, nombreImagen: data.nombreImagen, nombre: data.nombre, articulo: data.articulo, cantidad: data.cantidad, disponibilidad: data.disponibilidad, estado: data.estado, descripcion: data.descripcion, observaciones: data.observaciones, valor: data.valor, serie: data.serie, sede: data.sede, ubicacion: data.ubicacion, subUbicacion: data.subUbicacion}
            let qrData = {
              "subUbicacion": data.subUbicacion.key,
              "ingreso": data.key
            }
            let query = "";
            for (let key in qrData) {
                query += encodeURIComponent(key)+"="+encodeURIComponent(qrData[key])+"&";
            }
            let uri = 'https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+encodeURIComponent(query)//escape(JSON.stringify(qrData))
            data['qrUrl'] = encodeURI(uri)
            console.log('data para crear el acta:',data)
            createLabels(data).then(async function(response) {
              // Read result of the Cloud Function.
              este.etiqueta=[]
              await console.log('Etiqueta creada: ',response);
              este.etiqueta['url'] = 'https://docs.google.com/presentation/d/'+response.data.etiqueta.id+'/edit'//'/export/pdf'//'https://docs.google.com/document/d/'+response.data.doc.id+'/edit'
              firebase.database().ref('inventario')
              .child(articulo.subUbicacion.key).child(articulo.key)
              .update({
                etiqueta: este.etiqueta['url'],
                etiquetaId: response.data.etiqueta.id,
                fechaEtiqueta: new Date().toLocaleDateString()
              }).then(re=>{
                let message = 'La etiqueta fue creada'
                este.presentToastWithOptions(message,3000,'top')
                loading2.dismiss()
              })
            }).catch(function(error) {
              // Read result of the Cloud Function.
              loading2.dismiss()
              console.log('Error en crear Etiqueta: ',error);
              let message = 'Error en crear Etiqueta: '+error
              este.presentToastWithOptions(message,3000,'top')
            })
          }
        }
      ]
    });
    await alert.present();
  }
  async presentToastWithOptions(message,duration,position) {
    const toast = await this.toastController.create({
      message: message,
      // showCloseButton: true,
      position: position,
      duration: duration
      // closeButtonText: 'Done'
    });
    toast.present();
  }
  ngOnInit() {
  }

}
