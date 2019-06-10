import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit {
  @ViewChild('searchbar') inputElRef;
  
  sede:any = {};
  ubicacion:any = {};
  subUbicacion:any = {};
  sedes:any=[]
  sedest:any=[];
  cantidad: number = 0;
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
  scanData: any = {};
  PUSH_CHARS:string = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  timestamp: string;
  plataforma: any = {};
  translate: any = {};
  public toggled: boolean = false;
  ruta: any;
  constructor(
    public platform: Platform,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private nativeStorage: NativeStorage,
    private barcodeScanner: BarcodeScanner,
  ) {
    let este = this
    this.plataforma.desktop = this.platform.is("desktop");
    this.plataforma.android = this.platform.is("android");
    localStorage.setItem('plataforma', JSON.stringify(this.plataforma))
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
    // this.serialesRef();
    /* "sedes": {
      "sedeId":{
          "nombre":"string",
          "cantidad":"number",
          "descripcion":"string",
          "imagen":"string",
          "modificacion":"string"
      }
    } */
    // Carga inicial y eventos de creacion de sedes
    this.translate = { sedes:{},ubicaciones:{},subUbicaciones:{} }
    firebase.database().ref('ubicaciones2').once('value',(data)=>{
      este.translate.ubicaciones = data.val();
    }).then(()=>{
      firebase.database().ref('subUbicaciones2').once('value',(data2)=>{
        este.translate.subUbicaciones = data2.val();
      }).then(()=>{
        firebase.database().ref('sedes').on('child_added', function(added){
          // console.log('Data added',added.val())
          let sed = {}
          este.cantidad += 1;
          sed = added.val();
          // sed['codigo'] = '0'+este.cantidad
          sed['key'] = added.key;
          sed['imagen'] = "/assets/shapes.svg";
          if(added.val().imagen){
            sed['imagen'] = added.val().imagen; 
          }
          este.contador['sede'] += added.val().cantidad
          este.sedes.push(sed)
          este.sedest.push(sed)
          este.translate.sedes[added.key] = sed
          localStorage.setItem('translate', JSON.stringify(este.translate))
        });
      });
    });
    
    // ojo hacer desde cloud functions
    firebase.database().ref('sedes').on('child_changed', function(change){
      console.log('Data Change',change.val(),change.key)
      console.log(este.translate.sedes[change.key])
      for(let i in este.sedes){
        if(este.sedes[i].key == change.key){
          este.contador['sede'] -= este.sedes[i].cantidad
          este.sedes[i] = change.val()
          este.sedes[i]['key'] = change.key;
          este.sedes[i]['imagen'] = "/assets/shapes.svg";
          if(change.val().imagen){
            este.sedes[i]['imagen'] = change.val().imagen; 
          }
          este.translate.sedes[change.key] = este.sedes[i]
          este.contador['sede'] += este.sedes[i].cantidad
          break
        }
      }
    });
    // ojo hacer desde cloud functions
    firebase.database().ref('sedes').on('child_removed', function(removed){
      console.log('Data removed',removed.val())
      console.log(este.translate.sedes[removed.key])
      for(let i in este.sedes){
        if(este.sedes[i].key == removed.key){
          este.cantidad -= 1;
          este.contador['sede'] -= este.sedes[i].cantidad
          este.sedes.splice(i, 1);
          delete este.translate.sedes[removed.key]
          break
        }
      }
    });
    firebase.database().ref('articulos').once('value',articulosSnapX=>{
      // console.log('Entro en sedes a: firebase.database().ref(articulos)')
      este.articulosX['existen'] = {}
      este.articulosX['no existen'] = []
      este.articulosX['existen'] = articulosSnapX.val();

      este.translate['articulos'] = {};
      este.translate['articulos'] = articulosSnapX.val();
      articulosSnapX.forEach(articulo=>{
        este.translate['articulos'][String(articulo.val().nombre).toUpperCase()] = {
          nombre: articulo.val().nombre,
          key: articulo.key
        };
      })
    }).then(()=>{
      console.log("Comienza",este.translate)
      localStorage.setItem('translate', JSON.stringify(este.translate))
    })      
    console.log('Sedes:',este.sedes)
  }
  cargaInicial(){
    let este = this
    // cargo la data de las sedes una unica vez al iniciar para mostrar en la UI
    firebase.database().ref('sedes').once('value', function(sedeSnapshot) {
      // console.log('Entro en sedes a: firebase.database().ref(sedes)')
      este.sedes = []
      let sed = {}
      este.sede = sedeSnapshot.val();
      este.cantidad = sedeSnapshot.numChildren();
      este.contador['sede'] = 0;
      sedeSnapshot.forEach(sede => {
        // // console.log(sede.val())
        sed = sede.val();
        sed['key'] = sede.key;
        sed['imagen'] = "/assets/shapes.svg";
        if(sede.val().imagen){
          sed['imagen'] = sede.val().imagen; 
        }
        este.contador['sede'] += sede.val().cantidad
        este.sedes.push(sed)
      });
      este.sedest = este.sedes;
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
  async corregir(){
    let este = this;
    let error = {}
    error["TV"]={
      corregir: "Televisor"
    };
    error["Pupitre con espaldar y brazo en MADERA, con estructura en ANGULO metalico"]={
      corregir: "Pupitre con espaldar y brazo en MADERA, con estructura en ANGULO metalico"
    };
    error["Kit silla y mesa pequeña con superficie, espaldar plástico con estructura en tubo metalico"]={
      corregir: "Kit silla y mesa pequeña con superficie, espaldar PLASTICO con estructura en TUBO metalico"
    };
    error["Gabinete Metálico Aéreo"]={
      corregir: "Gabinete Metálico Aéreo"
    };
    error["Lampara incandescente de alta potencia"]={
      corregir: "Lampara incandescente de alta potencia"
    };
    error["Silla plástica con descansa brazo"]={
      corregir: "Silla plastica con descansa brazo"
    };
    error["Silla plastica con descansa brazo"]={
      corregir: "Silla plastica con descansa brazo"
    };
    error["Gabinete"]={
      corregir: "Gabinete"
    };
    error["Silla PLASTICA PEQUEÑA sin descansa brazo"]={
      corregir: "Silla PLASTICA PEQUEÑA con descansa brazo"
    };
    error["Mesa metálica pequeña "] = {
      corregir: "Mesa metálica pequeña"
    }
    error["Parlantes multimedia "] = {
      corregir: "Parlantes multimedia"
    }
    error["Bombilla de 100 voltios "] = {
      corregir: "Bombilla de 100 voltios"
    }
    error["Estufa a gas de dos fogones "] = {
      corregir: "Estufa a gas de dos fogones"
    }
    error["Gabinete Metálico Aéreo "] = {
      corregir: "Gabinete Metálico Aéreo"
    }
    error["Mesa de computador "] = {
      corregir: "Mesa de computador"
    }
    // console.log('error',error)
    este.ruta['articulos con nombre errado'] = [];
    return firebase.database().ref('inventario').once('value',async subUbicaciones=>{
      await subUbicaciones.forEach(subUbicacion=>{
        subUbicacion.forEach(ingreso=>{
          firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
          .child('sede').set(este.ruta['subUbicaciones'][subUbicacion.key].sede).then(async r=>{
            await firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
            .child('ubicacion').set(este.ruta['subUbicaciones'][subUbicacion.key].ubicacion).then(async r=>{
              await firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
              .child('subUbicacion').set({
                nombre: este.ruta['subUbicaciones'][subUbicacion.key].nombre,
                key: subUbicacion.key
              }).then(r=>{
                // console.log(ingreso.val())
              })
            })
          }).then(()=>{
            if(este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()]){
              firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
              .child('articulo').set(este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()])
            }else{
              // ----- si el articulo no existe --------------
              // console.log('error: ',ingreso.val().nombre,este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()])
              if(este.ruta['articulos'][String(error[ingreso.val().nombre].corregir).toUpperCase()]){
                firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
                .child('articulo').set(este.ruta['articulos'][String(error[ingreso.val().nombre].corregir).toUpperCase()]) 
              }else{
                este.ruta['articulos con nombre errado'].push(ingreso.val());
                // console.log('articulos con nombre errado',este.ruta['subUbicaciones'][subUbicacion.key],ingreso.val())
              }
            }
          })
        })
      })
    })
    // console.log('Rutas Corregidas',este.ruta)
  }
  decodeFbPushId(id) {
    id = id.substring(0,8);
    let timestamp = 0;
    for (let i=0; i < id.length; i++) {
      let c = id.charAt(i);
      timestamp = timestamp * 64 + this.PUSH_CHARS.indexOf(c);
    }
    return timestamp;
  }
  async corregirFechaCreacion(){
    let este = this;
    let sub={}
    return firebase.database().ref('inventario').once('value',async subUbicaciones=>{
      sub = subUbicaciones.val();
    }).then(()=>{
      for(let i in sub){
        for(let j in sub[i]){
          // console.log('PushId: ',j)
          sub[i][j]['creacion'] = new Date(este.decodeFbPushId(j)).toLocaleDateString();
        }
      }
      firebase.database().ref('inventario').update(sub).then(()=>{
        // console.log('Termino')
        return 'Termino'
      })
    })
  }
  serialesRef(){
    // Creo una referencia on los numeros seriales de los articulos para su consulta
    let este = this;
    let ser = {};
    let seriales = {};
    return firebase.database().ref('inventario').once('value',async subUbicaciones=>{
      ser = subUbicaciones.val();
    }).then(()=>{
      for(let i in ser){
        for(let j in ser[i]){
          // // console.log('PushId: ',j)
          if(ser[i][j]['serie']!=''){
            seriales[ser[i][j]['serie']] = {
              subUbicacionkey: i,
              articulokey: j
            };
          }
        }
      }
      // // console.log('seriales',seriales)
      firebase.database().ref('seriales').update(seriales).then(()=>{
        // console.log('Termino seriales')
        return 'Termino seriales'
      })
    })
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
  deleteFCloud(){
    let deleteF = firebase.functions().httpsCallable("deleteF");
    deleteF('184kFAcimERukjy6zCKC6qoSvqUouGEP_').then(function(reponse) {
      // Read result of the Cloud Function.
      // console.log('Archivo eliminado: ',reponse);
      // ...
    }).catch(function(error) {
      // Read result of the Cloud Function.
      // console.log('Archivo eliminado error: ',error);
      // ...
    })
  }
  delay(milliseconds: number, count: number): Promise<number> {
    return new Promise<number>(resolve => {
      setTimeout(() => {
        resolve(count);
      }, milliseconds);
    });
  }
  async creaEtiquetas(): Promise<void> {
    // console.log("Hello");
    let este = this;
    let conta = 5822;//4920;//4517;//4231;//3806;//3674;//3553;//3489;//3096;//2548;
    let createLabels = firebase.functions().httpsCallable("createLabels");
    // console.log(este.articulos.length)
    for (let i=conta; i < este.articulos.length; i++) {
      let data = este.articulos[i]
      // await is converting Promise<number> into number
      const count:number = await this.delay(1500, conta);
      // console.log(i);
      if(!data.etiquetaId){
        // // console.log('Entro',conta,i,data)
        // // console.log('data',data)
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
        // // console.log('data para crear el acta:',data)
        await createLabels(data).then(async function(response) {
          // Read result of the Cloud Function.
          este.etiqueta=[]
          // // console.log(conta,i,data,'Funcion Etiqueta respondio ok: ',response);
          este.etiqueta['url'] = 'https://docs.google.com/presentation/d/'+response.data.etiqueta.id+'/edit'//'/export/pdf'//'https://docs.google.com/document/d/'+response.data.doc.id+'/edit'
          await firebase.database().ref('inventario')
          .child(data.subUbicacion.key).child(data.key)
          .update({
            etiqueta: este.etiqueta['url'],
            etiquetaId: response.data.etiqueta.id,
            fechaEtiqueta: new Date().toLocaleDateString()
          }).then(re=>{
            let message = 'La etiqueta fue creada'
            // console.log(conta,i,data,message)
            // este.presentToastWithOptions(message,3000,'top')
          })
        }).catch(function(error) {
          // Read result of the Cloud Function.
          // console.log(conta,i,'Error en crear Etiqueta: ',error);
          // let message = 'Error en crear Etiqueta: '+error
          // este.presentToastWithOptions(message,3000,'top')
        })
      }
      conta+=1
    }

    // console.log("World!")
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
      // console.log('Entro en sedes')
      let ubi = {};
      await subUbicaciones.forEach(subUbicacion => {
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
          // console.log('Entro en sedes')
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
          // // console.log('b',este.inventario)
        });
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
          // console.log('Entro en sedes')
          este.inventario['articulos']['malos']['cantidad'] += MaloSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += MaloSnapshot.numChildren();
          este.inventario['articulos']['malos']['articulosObj'] = Object.assign(este.inventario['articulos']['malos']['articulosObj'], MaloSnapshot.val());
          MaloSnapshot.forEach(data=>{
            let artdata = {};
            artdata = data.val();
            artdata['key'] = data.key
            este.inventario['articulos']['malos']['articulosArray'].push(artdata)            
          })
          // // console.log('m',este.inventario)
        });
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
          // console.log('Entro en sedes')
          este.inventario['articulos']['regulares']['cantidad'] += RegularSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += RegularSnapshot.numChildren();
          este.inventario['articulos']['regulares']['articulosObj'] = Object.assign(este.inventario['articulos']['regulares']['articulosObj'], RegularSnapshot.val());
          RegularSnapshot.forEach(data=>{
            let artdata = {};
            artdata = data.val();
            artdata['key'] = data.key
            este.inventario['articulos']['regulares']['articulosArray'].push(artdata)            
          })
          // // console.log('r',este.inventario)
        });
      })
    }
    inventarioRef.on('value', carga);
    // console.log('Inventario: ',este.inventario)
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
        // // console.log(articulo.val())
        art = articulo.val();
        if(art['nombre'] != este.nombresArt[art['articulo'].key].nombre){
          // console.log('El nombre no es igual')
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
      // // console.log(artUnicos);
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
      // console.log('articulos unicos: ',este.inventario['articulos unicos'])
      este.articulost = este.articulos;
    }
    inventarioRef.on('value', carga); */
  }
  async resumen2(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    if(!this.articulos){
      this.articulos = [];
      const loading = await this.loadingController.create({
        message: 'Creando vista de resumen general...'
      });
      await loading.present();
    // ------ Resumen -----------------------------
      firebase.database().ref('inventario2').on('value',async ingresos =>{
        ingresos.forEach(added=>{
          // console.log(added.val())
          este.inventario['numArticulos'] += 1;
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
          // Ingreso
          // Modificación
          // Ingreso key
          // Articulo key
          // Nombre
          // Sede
          // Ubicación
          // Sub-ubicación
          // Valor
          // Disponible
          // Estado
          // Imagen
          // Observaciones
          // Descripcion
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
              este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['cantidad'] += 1;
              este.inventario['articulos unicos'][art].articulos[este.articulos[i].key]=este.articulos[i]
              switch (este.articulos[i].estado) {
                case 'Bueno':
                  este.inventario['articulos unicos'][art]['bueno'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['bueno'] += 1
                  break;
                case 'Regular':
                  este.inventario['articulos unicos'][art]['regular'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['regular'] += 1
                  break;
                case 'Malo':
                  este.inventario['articulos unicos'][art]['malo'] += 1
                  este.inventario['resumen'][este.translate.articulos[String(artUnicos[art]).toUpperCase()].key]['malo'] += 1
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
                this.pregunta = false;
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
                este.sheetData['titulo'] = 'General';
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
                console.log('Data a exportar',data)
                // loading2.dismiss();
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
          este.contador.cantidad = 0
          este.contador.buenos = 0
          este.contador.regulares = 0
          este.contador.malos = 0
          articulosSnap.forEach(articulo => {
            // console.log(articulo.val())
            if(este.articulosX['existen'][articulo.val().articulo.key]){
              // este.contador.sede += 1;
              este.articulosX['existen'][articulo.val().articulo.key].cantidad += 1;
            }else{
              este.articulosX['no existen'].push(articulo.val())
            }
            let modificacion = ''
            if(articulo.val().modificacion){
              modificacion = articulo.val().modificacion
            }
            let art = articulo.val();
            art['key'] = articulo.key;
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
      }).then(async r=>{
        firebase.database().ref('articulos').update(este.articulosX['existen']) // actualizo los contadores de articulos
        let resumen = []
        for(let i in este.inventario['articulos unicos']){
          if(este.inventario['articulos unicos'][i].nombre==undefined){
            // console.log('undefined:',este.inventario['articulos unicos'][i])
          }
          resumen.push({
            nombre: este.inventario['articulos unicos'][i].nombre,
            cantidad: este.inventario['articulos unicos'][i].cantidad,
            bueno: este.inventario['articulos unicos'][i].bueno,
            malo: este.inventario['articulos unicos'][i].malo,
            regular: este.inventario['articulos unicos'][i].regular
          })
        }
        // console.log(resumen)
        firebase.database().ref('resumen/general').set(resumen)
        loading.dismiss()
        const alert = await this.alertController.create({
          header: este.tituloAlertas,
          message: 'Desea <strong>recibir una copia del resumen de su inventario</strong> en Google Sheets!!!',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
                // console.log('Confirm Cancel: no envio el resumen');
                this.pregunta = false;
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
                let data = este.sheetData
                // ---- ordena tabla para docs -----------------------------------
                  let tabla = {
                    table: {
                      columns: 5,
                      rows: este.sheetData.values.length,
                      tableRows: []
                    }
                  }
                  let tableCells = []
                  let content = []
                  for(let i in data.values){
                    tableCells = []
                    for(let j in data.values[i]){
                      content = []
                      content.push({
                          paragraph: data.values[i][j]
                      })
                      tableCells.push({content:content})
                    }
                    tabla.table.tableRows.push({tableCells:tableCells})
                  }
                  // console.log('Tabla Doc',tabla)
                // ---------------------------------------------------------------
                let exportaFS = firebase.functions().httpsCallable("exportaFS");
                exportaFS(data).then(async function(response) {
                  // Read result of the Cloud Function.
                  // await console.log('Archivo creado: ',response);
                  este.sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
                  let message = 'El resumen fué creado'
                  este.presentToastWithOptions(message,3000,'top')
                  loading2.dismiss()
                }).catch(function(error) {
                  // Read result of the Cloud Function.
                  // console.log('Error en crear Archivo: ',error);
                })
              }
            }
          ]
        });
        await alert.present();
        // console.log('articulos unicos: ',este.inventario['articulos unicos'],este.articulosX,este.sheetData)
      })
    }
  }
  resumenGeneral(){
    let este = this
    this.resument = true
    this.listat = false
    this.listaR = false
    firebase.database().ref('resumen/general').once('value',data=>{
      este.inventario['articulos unicos'] = data.val();
    })
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
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    for(let i in articulo.articulos){
      este.articulosR.push(articulo.articulos[i])
    }
    // console.log('Todos: ',this.articulosR)
  }
  Buenos(articulo){
    let este = this
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    // console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Bueno"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    // console.log('Bueno: ',this.articulosR)
  }
  Malos(articulo){
    let este = this
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    // console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Malo"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    // console.log('Malo: ',this.articulosR)
  }
  Regular(articulo){
    let este = this
    this.resument = false
    this.listat = false
    this.listaR = true
    this.articulosR = []
    // console.log(articulo)
    for(let i in articulo.articulos){
      if(articulo.articulos[i].estado == "Regular"){
        este.articulosR.push(articulo.articulos[i])
      }
    }
    // console.log('Regular: ',this.articulosR)
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
  async Editlocacion(locacion:any) {
    let este = this
    this.navCtrl.navigateForward(['crea-locacion',{
      accion:'editar',
      locacionNombre: locacion.nombre,
      locacionChild: 'sedes',
      locacionkey: locacion.key,
      sedeNombre: locacion.nombre,
      sedekey: locacion.key
    }]);
    return
  }
  async CreateSede() {
    this.navCtrl.navigateForward(['crea-locacion',{
      accion:'crear',
      locacionChild: 'sedes'
    }]);
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
            // console.log('Crear Cancel');
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
              // console.log('Archivo creado: ',reponse);
            }).catch(function(error) {
              // Read result of the Cloud Function.
              // console.log('Error en crear Archivo: ',error);
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
            // console.log('Eliminar Cancel: blah');
          }
        }, {
          text: 'eliminar',
          handler:async () => {
            // let index = this.sedes.indexOf(sede)
            // firebase.database().ref('sedes/'+sede.key).remove()
            if(sede.cantidad<=0){
              let RemoveSedes = firebase.functions().httpsCallable("RemoveSedes");
              let data = {
                sede: sede.nombre,
                key: sede.key
              }
              await RemoveSedes(data).then(function(reponse) {
                // Read result of the Cloud Function.
                // console.log('Archivo eliminado: ',reponse);
              }).catch(function(error) {
                // Read result of the Cloud Function.
                // console.log('Archivo eliminado error: ',error);
              })
            }else{
              const alert = await this.alertController.create({
                header: 'Error eliminando la sede '+sede.nombre+' !!!',
                // subHeader: 'Subtitle',
                message: 'La sede no puede eliminarse por que tiene articulos relacionados en su inventario, elimine todos los articulos antes de eliminar la sede.',
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
          // console.log(este.articulosR, index)
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
            // console.log('Confirm Cancel: no se dará de baja el articulo');
          }
        }, {
          text: 'Si',
          handler: async () => {
            // // console.log('Confirm Okay');
            await alert.present();
            const loading2 = await this.loadingController.create({
              message: 'Creando acta de Baja de articulo...'
            });
            await loading2.present();
            let BajaDeArticulo = firebase.functions().httpsCallable("BajaDeArticulo");
            let data = articulo
            data['fecha'] = new Date().toLocaleDateString();
            // console.log('data para crear el acta:',data)
            BajaDeArticulo(data).then(async function(response) {
              // Read result of the Cloud Function.
              este.actaBaja=[]
              articulo.disponibilidad = 'No'
              // await console.log('Archivo creado: ',response);
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
              // console.log('Error en crear Archivo: ',error);
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
            // console.log('Confirm Cancel: no se creara una nueva etiqueta para el articulo');
          }
        }, {
          text: 'Si',
          handler: async () => {
            // // console.log('Confirm Okay');
            await alert.present();
            const loading2 = await this.loadingController.create({
              message: 'Creando etiqueta de articulo...'
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
            // console.log('data para crear el acta:',data)
            createLabels(data).then(async function(response) {
              // Read result of the Cloud Function.
              este.etiqueta=[]
              // await console.log('Etiqueta creada: ',response);
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
              // console.log('Error en crear Etiqueta: ',error);
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
