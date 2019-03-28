import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
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
  inventario: any = {};
  nombresArt: any;
  listat:any = true;
  resument:any = false;
  listaR:any = false;
  articulos: any;
  articulost: any;
  articulosR: any[];
  articulosRtemp: any[];
  actaBaja: any;
  tituloAlertas:string = 'Inventarios Denzil Escolar!';
  etiqueta: any[];
  constructor(
    public route: ActivatedRoute,
    public plataforma: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
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
      console.log('Entro en sedes ubicaciones')
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
  async resumen(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    if(!este.articulos){
      const loading = await this.loadingController.create({
        message: 'Creando resumen de sede '+this.sede.nombre
      });
      await loading.present();
      firebase.database().ref('inventario').once('value',subSnap=>{
        este.articulos = [];
        este.contador.sede = 0;
        este.inventario['articulos unicos'] = [];
        subSnap.forEach(articulosSnap=>{
          articulosSnap.forEach(articulo => {
            if(articulo.val().sede.nombre == este.sede.nombre){
              // console.log(articulo.val())
              este.contador.sede += 1;
              let art = articulo.val();
              art['key'] = articulo.key;
              este.articulos.push(art)
            }
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
      }).then(r=>{
        loading.dismiss()
      })
    }
  }
  lista(){
    this.resument = false
    this.listat = true
    this.listaR = false
  }
  total(articulo){
    let este = this
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
