import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, ToastController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';

@Component({
  selector: 'app-inventario-sububicacion',
  templateUrl: './inventario-sububicacion.page.html',
  styleUrls: ['./inventario-sububicacion.page.scss'],
})
export class InventarioSububicacionPage implements OnInit {
  articulos:any=[];
  articulost:any;
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
  nombresArt: any;
  actaBaja: any;
  tituloAlertas:string = 'Inventarios Denzil Escolar!';
  etiqueta: any[];
  constructor(
    public plataforma: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
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
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
      console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Bueno)')
      este.inventario['buenos'] = BuenoSnapshot.numChildren();
      // console.log('b',este.inventario)
    });
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
      console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Malo)')
      este.inventario['malos'] = MaloSnapshot.numChildren();
      // console.log('m',este.inventario)
    });
    firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
      console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Regular)')
      este.inventario['regulares'] = RegularSnapshot.numChildren();
      // console.log('r',este.inventario)
    });
    firebase.database().ref('articulos').on('value',articulos=>{
      console.log('Entro en inventario-sububicacion a: firebase.database().ref(articulos)')
      este.nombresArt = articulos.val();
      console.log('Nombres: ',este.nombresArt)
      este.cargaDataVistaFontral()
    })
  }
  cargaDataVistaFontral(){
    let este = this;
    let inventarioRef = firebase.database().ref('inventario/'+this.SubUbicacion.key)
    let carga = function(articulosnapshot) {
      console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key)')
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
        /* if(art['nombre'] != este.nombresArt[art['articulo'].key].nombre){
          console.log('El nombre no es igual')
          inventarioRef.off('value', carga)
          firebase.database().ref('inventario').child(este.SubUbicacion.key)
          .child(articulo.key).child('nombre').set(este.nombresArt[art['articulo'].key].nombre)
          .then(x=>{
            inventarioRef.on('value', carga)
          })
        } */
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
      /* for(let art in artUnicos){
        este.inventario['articulos unicos'][artUnicos[art]] = {
          nombre: artUnicos[art],
          cantidad:0,
          bueno:0,
          malo:0,
          regular:0
        }
        este.inventario['articulos unicos'][artUnicos[art]].articulos = [];
        for(let i in este.articulos){
          if(este.articulos[i].nombre == artUnicos[art]){
            este.inventario['articulos unicos'][artUnicos[art]]['cantidad'] += 1;
            este.inventario['articulos unicos'][artUnicos[art]].articulos[este.articulos[i].key]=este.articulos[i]
            switch (este.articulos[i].estado) {
              case 'Bueno':
                este.inventario['articulos unicos'][artUnicos[art]]['bueno'] += 1
                break;
              case 'Regular':
                este.inventario['articulos unicos'][artUnicos[art]]['regular'] += 1
                break;
              case 'Malo':
                este.inventario['articulos unicos'][artUnicos[art]]['malo'] += 1
                break;
              default:
                break;
            }
          }
        }
      } */
      este.inventario['articulos unicos']['sede'] = este.sede
      este.inventario['articulos unicos']['ubicacion'] = este.ubicacion
      este.inventario['articulos unicos']['SubUbicacion'] = este.SubUbicacion
      // firebase.database().ref('resumenes').child(este.SubUbicacion.key).set(este.inventario['articulos unicos'])
      este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
      console.log('articulos unicos: ',este.inventario['articulos unicos'])
      este.articulost = este.articulos;
    }
    inventarioRef.on('value', carga);
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
    /* firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Regular').once('value', function(RegularSnapshot) {
      este.inventario['regulares'] = RegularSnapshot.numChildren();
      este.articulos = []
      let art = {}
      RegularSnapshot.forEach(articulo => {
        console.log('Regular: ',articulo.val())
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
      if(articulo.articulos[i].estado == "Regular"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    console.log('Regular: ',this.articulosR)
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