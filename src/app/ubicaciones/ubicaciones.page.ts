import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
})
export class UbicacionesPage implements OnInit {
  @ViewChild('searchbar') inputElRef;
  
  ubicaciones:any=[]
  ubicaciones2:any;
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
  toggled: boolean = false;
  sheetData: any = {};
  plataforma: any = {};
  translate: any = {};
  scanData: { subkey: string; artkey: string; };
  constructor(
    public route: ActivatedRoute,
    public platform: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private barcodeScanner: BarcodeScanner,
  ) {
    let este = this
    este.sheetData.class = 'normal';
    this.plataforma.desktop = this.platform.is("desktop");
    this.plataforma.android = this.platform.is("android");
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    this.toggled = false;
    this.contador['sede'] = 0;
    this.inventario['articulos unicos'] = [];
    this.inventario['numArticulos'] = 0;
    this.inventario['detallado'] = [];
    this.inventario['resumen'] = [];
    this.inventario['buenos'] = 0;
    this.inventario['regulares'] = 0;
    this.inventario['malos'] = 0;
    this.articulos = null;
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
    este.translate = JSON.parse(localStorage.getItem('translate'))
    // ---- Organizar con el nuevo esquema -----
      // El codigo de las sedes se lo puse a mano OJO
      /* este.ubicaciones2 = {}
      firebase.database().ref('ubicaciones').once('value',(data)=>{
        data.forEach(sede =>{
          este.cantidad = 0;
          // console.log('Sede:',sede.key)
          sede.forEach(ubicacion =>{
            este.cantidad += 1;
            console.log('ubicacion:',ubicacion.val())
            este.ubicaciones2[ubicacion.key] = ubicacion.val();
            este.ubicaciones2[ubicacion.key]['sede'] = sede.key;
            este.ubicaciones2[ubicacion.key]['codigo'] = este.translate.sedes[sede.key].codigo + '0' + este.cantidad
          })
        })
      }).then(()=>{
        firebase.database().ref('ubicaciones2').set(este.ubicaciones2);
      })
      console.log('Fin de Organizar con el nuevo esquema',este.ubicaciones2) */
    // -----------------------------------------
    // ---- Nueva forma de leer los datos ------
      // firebase.database().ref('sedes').set(este.translate.sedes)
      este.cantidad = 0;
      este.contador['sede'] = 0;
      este.ubicaciones = [];
      este.ubicacionest = [];
      firebase.database().ref('ubicaciones2').orderByChild("sede").equalTo(this.sede.key).on('child_added',(added)=>{
        // console.log('Ubicaciones added',added.val())
        let ubi = {}
        este.cantidad += 1;
        ubi = added.val();
        ubi['key'] = added.key;
        ubi['imagen'] = "/assets/shapes.svg";
        if(added.val().imagen){
          ubi['imagen'] = added.val().imagen; 
        }
        este.contador['sede'] += added.val().cantidad
        // firebase.database().ref('sedes')
        // .child(this.sede.key).child('cantidad').set(este.contador['sede']);
        este.ubicaciones.push(ubi)
        este.ubicacionest.push(ubi)
      })
      // ojo hacer desde cloud functions
      firebase.database().ref('ubicaciones2').orderByChild("sede").equalTo(this.sede.key).on('child_changed', function(change){
        console.log('Ubicaciones Change',change.val(),change.key)
        console.log(este.translate.ubicaciones[change.key])
        for(let i in este.ubicaciones){
          if(este.ubicaciones[i].key == change.key){
            este.contador['sede'] -= este.ubicaciones[i].cantidad
            este.ubicaciones[i] = change.val()
            este.ubicaciones[i]['key'] = change.key;
            este.ubicaciones[i]['imagen'] = "/assets/shapes.svg";
            if(change.val().imagen){
              este.ubicaciones[i]['imagen'] = change.val().imagen; 
            }
            este.translate.ubicaciones[change.key] = este.ubicaciones[i]
            este.contador['sede'] += este.ubicaciones[i].cantidad
            break
          }
        }
      });
      // ojo hacer desde cloud functions
      firebase.database().ref('ubicaciones2').orderByChild("sede").equalTo(this.sede.key).on('child_removed', function(removed){
        console.log('Data removed',removed.val())
        // este.cargaInicial();
      });
      console.log(este.translate,este.ubicaciones)
    // -----------------------------------------
  }
  escaner(){
    // subUbicacion%3D-L_Z3Uw_56THWtGrdcSW%26ingreso%3D-L_doWHLU9J9fg1Smidc%26
    this.barcodeScanner.scan().then(async barcodeData => {
      // console.log(barcodeData.text.indexOf("&"),'barcodeData:',barcodeData.text)
      if(barcodeData.text.indexOf("%26")!=-1){
        // Es una etiqueta de un articulo
        // console.log('Es una etiqueta de un articulo', barcodeData.text);
        let res = decodeURIComponent(barcodeData.text);
        res = res.substring(0, res.length-1);
        let n = res.indexOf("&");
        this.scanData = {
          subkey : res.substring(0+"subUbicacion=".length, n),
          artkey : res.substring(n+1+"ingreso=".length, res.length)
        };
        if(this.scanData.artkey&&this.scanData.subkey){
          this.navCtrl.navigateForward(['view-articulo',{
            articulokey: this.scanData.artkey,
            SubUbicacionkey: this.scanData.subkey
          }]);
        }
      }else{
        // Es un serial de un articulo
        firebase.database().ref('seriales').child(barcodeData.text).once('value',async scanData=>{
          // console.log('Es un serial de un articulo', barcodeData.text,scanData.val());
          if(scanData.val()){
            this.navCtrl.navigateForward(['view-articulo',{
              articulokey: scanData.val().articulokey,
              SubUbicacionkey: scanData.val().subUbicacionkey
            }]);
          }else{
            const alert = await this.alertController.create({
              header: 'Error',
              // subHeader: 'Subtitle',
              message: 'Serial no encontrado en el inventario',
              buttons: ['OK']
            });
            await alert.present();
          }
        })
      }
    }).catch(err => {
      // console.log('Error', err);
    });
  }
  public toggle(): void {
    this.toggled = !this.toggled;
    setTimeout(() => {
      // // console.log(this.inputElRef)
      this.inputElRef.setFocus()
    }, 50);
  }
  public onBlur(ev:any): void {
    // // console.log('estado:',ev)
    this.toggled = !this.toggled;
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
        este.inventario['detallado'] = [];
        subSnap.forEach(articulosSnap=>{
          este.contador.cantidad = 0
          este.contador.buenos = 0
          este.contador.regulares = 0
          este.contador.malos = 0
          articulosSnap.forEach(articulo => {
            if(articulo.val().sede.key == este.sede.key){
              // console.log(articulo.val())
              este.contador.sede += 1;
              let art = articulo.val();
              art['key'] = articulo.key;
              let modificacion = ''
              if(articulo.val().modificacion){
                modificacion = articulo.val().modificacion
              }
              este.articulos.push(art)
              este.inventario['detallado'].push([
                articulo.val().creacion,
                modificacion,
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
                este.contador.cantidad += 1
                este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
                switch (este.articulos[i].estado) {
                  case 'Bueno':
                    este.inventario['articulos unicos'][art]['bueno'] += 1
                    este.contador.buenos += 1
                    break;
                  case 'Regular':
                    este.inventario['articulos unicos'][art]['regular'] += 1
                    este.contador.regulares += 1
                    break;
                  case 'Malo':
                    este.inventario['articulos unicos'][art]['malo'] += 1
                    este.contador.malos += 1
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
        // ---------------------------------------------------------------
          este.sheetData['values'] = [];
          este.sheetData['detallado'] = este.inventario['detallado'];
          este.sheetData['titulo'] = 'General';
          este.sheetData['sheet'] = ['Resumen','Inventario Detallado'];
          este.sheetData['range'] = ['Resumen!A2:E','Inventario Detallado!A2:Z'];
          este.sheetData['spreadsheetId'] = '1588aKnTpo2G9WXWVPOW5S0c319qkvC1GKj4wkbqz-Lw';
          for(let fila in este.inventario['articulos unicos']){
            // // console.log(este.inventario['articulos unicos'][fila])
            este.sheetData.values.push([
              este.inventario['articulos unicos'][fila].nombre,
              este.inventario['articulos unicos'][fila].cantidad,
              este.inventario['articulos unicos'][fila].bueno,
              este.inventario['articulos unicos'][fila].malo,
              este.inventario['articulos unicos'][fila].regular]
            )
          }
        // ---------------------------------------------------------------
        loading.dismiss()
      })
    }
  }
  async sheetOld(){
    if(this.sheetData['url']){
      window.open(this.sheetData.url,'_blank');
    }else{
      // ---------------------------------------------------------------
        let este = this
        const loading2 = await this.loadingController.create({
          message: '...Generando archivo de resumen en Google Sheets...'
        });
        await loading2.present();
        let exportaFS = firebase.functions().httpsCallable("exportaFS");
        exportaFS(this.sheetData).then(async function(response) {
          // Read result of the Cloud Function.
          await console.log('Archivo creado: ',response,este.sheetData);
          este.sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
          let message = 'El resumen fué creado'
          este.presentToastWithOptions(message,3000,'top')
          loading2.dismiss()
          window.open(este.sheetData.url,'_blank');
        }).catch(function(error) {
          // Read result of the Cloud Function.
          console.log('Error en crear Archivo: ',error);
        })
      // ---------------------------------------------------------------
    }
  }
  async resumen2(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    if(!this.articulos){
      this.articulos = [];
      este.contador.sede = 0;
      este.contador.cantidad = 0
      este.contador.buenos = 0
      este.contador.regulares = 0
      este.contador.malos = 0
      const loading = await this.loadingController.create({
        message: 'Creando vista de resumen general...'
      });
      await loading.present();
    // ------ Resumen -----------------------------
      firebase.database().ref('inventario2').orderByChild("sede").equalTo(this.sede.key).on('value',async ingresos =>{
        ingresos.forEach(added=>{
          // console.log(added.val())
          este.inventario['numArticulos'] += 1;
          este.contador.sede += 1;
          let inv = added.val();
          if(!este.translate.articulos[added.val().articulo]){
            inv['nombre'] = este.translate.articulos[added.val().articulo.key].nombre;
          }else{
            inv['nombre'] = este.translate.articulos[added.val().articulo].nombre;
          }
          inv['key'] = added.key;
          este.articulos.push(inv)
          switch (added.val().estado) {
            case 'Bueno':
              este.inventario['buenos'] += 1
              break;
            case 'Regular':
              este.inventario['regulares'] += 1
              break;
            case 'Malo':
              este.inventario['malos'] += 1
              break;
            default:
              break;
          }
          este.inventario['detallado'].push([
            added.val().creacion,
            added.val().modificacion,
            added.key,
            added.val().articulo,
            inv['nombre'],
            este.translate.sedes[added.val().sede].nombre,
            este.translate.ubicaciones[added.val().ubicacion].nombre,
            este.translate.subUbicaciones[added.val().subUbicacion].nombre,
            added.val().valor,
            added.val().disponibilidad,
            added.val().estado,
            added.val().imagen,
            added.val().observaciones,
            added.val().descripcion
          ]);
        })
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
          este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key] = {
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
              este.contador.cantidad += 1;
              este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['cantidad'] += 1;
              este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
              switch (este.articulos[i].estado) {
                case 'Bueno':
                  este.inventario['articulos unicos'][art]['bueno'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['bueno'] += 1
                  este.contador.buenos += 1
                  break;
                case 'Regular':
                  este.inventario['articulos unicos'][art]['regular'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['regular'] += 1
                  este.contador.regulares += 1
                  break;
                case 'Malo':
                  este.inventario['articulos unicos'][art]['malo'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['malo'] += 1
                  este.contador.malos += 1
                  break;
                default:
                  break;
              }
            }
          }
        }
        este.inventario['articulos unicos temp'] = este.inventario['articulos unicos'];
        /* firebase.database().ref('resumen').child('general').set({
          resumen: este.inventario['resumen'],
          cantidad: este.inventario['numArticulos'],
          buenos: este.inventario['buenos'],
          malos: este.inventario['malos'],
          regulares: este.inventario['regulares'],
        }) */
        este.articulost = este.articulos;
        loading.dismiss();
      })
    // --------------------------------------------
    }
    console.log(este.translate,este.inventario)
  }
  async sheet(){
    let este = this;
    if(!this.sheetData.url){
      if(this.articulos){
        const alert = await this.alertController.create({
          header: este.tituloAlertas,
          message: 'Desea <strong>crear un reporte del resumen de su inventario</strong> en Google Sheets!!!',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                // console.log('Confirm Cancel: no envio el resumen');
              }
            }, {
              text: 'Si',
              handler: async () => {
                // console.log('Confirm Okay: envio el resumen');
                const loading2 = await this.loadingController.create({
                  message: '...Generando archivo de resumen en Google Sheets...'
                });
                await loading2.present();
                este.sheetData['values'] = [];
                este.sheetData['detallado'] = este.inventario['detallado'];
                este.sheetData['titulo'] = este.translate.sedes[este.sede['key']].nombre;
                este.sheetData['sheet'] = ['Resumen','Inventario Detallado'];
                este.sheetData['range'] = ['Resumen!A2:E','Inventario Detallado!A2:Z'];
                // este.sheetData['spreadsheetId'] = '1588aKnTpo2G9WXWVPOW5S0c319qkvC1GKj4wkbqz-Lw';
                for(let fila in este.inventario['articulos unicos']){
                  // // console.log(este.inventario['articulos unicos'][fila])
                  este.sheetData.values.push([
                    este.inventario['articulos unicos'][fila].nombre,
                    este.inventario['articulos unicos'][fila].cantidad,
                    este.inventario['articulos unicos'][fila].bueno,
                    este.inventario['articulos unicos'][fila].malo,
                    este.inventario['articulos unicos'][fila].regular]
                  )
                }
                let data = este.sheetData
                let exportaFS = firebase.functions().httpsCallable("exportaFS");
                return exportaFS(data).then(async function(response) {
                  // Read result of the Cloud Function.
                  // await console.log('Archivo creado: ',response);
                  este.sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
                  let message = 'El resumen fué creado'
                  este.presentToastWithOptions(message,3000,'top')
                  loading2.dismiss();
                  window.open(este.sheetData.url,'_blank');
                }).catch(function(error) {
                  // Read result of the Cloud Function.
                  loading2.dismiss();
                  console.log('Error en crear Reporte: ',error);
                  este.presentToastWithOptions(error.message,3000,'top')
                })
              }
            }
          ]
        });
        await alert.present();
      }else{
        const alert = await this.alertController.create({
          header: 'Necesitas un paso más...',
          message: 'Primero debes generar un reporte para poder exportarlo!!.',
          buttons: [
            {
              text: 'oK',
              handler: () => {
                // console.log('Confirm Cancel: no envio el resumen');
                this.resumen2();
              }
            }]
        });
        await alert.present();
      }
    }else{
      window.open(this.sheetData.url,'_blank');
      return
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
    this.ubicaciones = this.ubicacionest;
    this.inventario['articulos unicos'] = this.inventario['articulos unicos temp'];
    this.articulosR = this.articulosRtemp;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      if(this.listat){
        this.ubicaciones = this.ubicaciones.filter((ubicacion) => {
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
    // console.log(this.sede,ubicacion)
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
            if(ubicacion.cantidad<=0){
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
            }else{
              const alert = await this.alertController.create({
                header: 'Error eliminando la ubicacion '+ubicacion.nombre+' !!!',
                // subHeader: 'Subtitle',
                message: 'La ubicacion no puede eliminarse por que tiene articulos relacionados en su inventario, elimine todos los articulos antes de eliminar la ubicacion.',
                buttons: ['OK']
              });
              await alert.present();
            }
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
  async Editlocacion(locacion:any) {
    let este = this
    this.navCtrl.navigateForward(['crea-locacion',{
      accion:'editar',
      locacionNombre: locacion.nombre,
      locacionChild: 'ubicaciones',
      locacionkey: locacion.key,
      ubicacionNombre: locacion.nombre,
      ubicacionkey: locacion.key,
      sedeNombre: este.sede.nombre,
      sedekey: este.sede.key
    }]);
    return
  }
  Etiqueta(articulo){
    window.open(articulo.etiqueta,'_blank');
  }
  ngOnInit() {
  }

}
