import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Http } from '@angular/http';
import { File } from '@ionic-native/file/ngx';
// import { SocialSharing } from "@ionic-native/social-sharing/ngx"
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import "firebase/functions";
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scanData;
  Path;
  base64Image;
  json:any = [];
  inventario:any = [];
  dataBase:any = [];
  cantidad: number;
  urls: any;
  ruta:any = {};
  articulos: any;
  newData: any;
  actualizaCantidad:any;
  sedes: any[];
  sede: any;
  contador: any = {};
  sedest: any[];
  PUSH_CHARS:string = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  timestamp: any;
  constructor(
    private barcodeScanner: BarcodeScanner,
    private http: Http,
    // private socialSharing: SocialSharing,
    private camera: Camera,
    private imageResizer: ImageResizer,
    private file: File,
    private loadingController: LoadingController
  ) { 
    let este = this;
    // this.http.get('../../assets/data/inventario-denzil-develop-export.json').subscribe(data => {
    //   this.newData = JSON.parse(data.text());
    // },err => console.log(err));

    // this.http.get('../../assets/data/dataBase.json').subscribe(data => {
    //   this.dataBase = JSON.parse(data.text());
    // },err => console.log(err));

    firebase.database().ref('sedes').on('value', function(sedeSnapshot) {
      console.log('Entro en home')
      este.ruta = sedeSnapshot.val();
      este.contador = {}
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
      firebase.database().ref('ubicaciones').once('value',async ubicaciones=>{
        este.ruta['ubicaciones']={}
        este.ruta['subUbicaciones']={}
        await ubicaciones.forEach(sede=>{
          este.ruta[sede.key]['ubicaciones']=sede.val();
          firebase.database().ref('subUbicaciones').once('value',async subUbicaciones=>{
            await subUbicaciones.forEach(ubicacion=>{
              este.ruta['ubicaciones'][ubicacion.key]={}
              este.ruta['ubicaciones'][ubicacion.key] = ubicacion.val();
              este.ruta['ubicaciones'][ubicacion.key]['sede'] ={
                key:sede.key,
                nombre:este.ruta[sede.key].nombre
              }
              if(este.ruta[sede.key]['ubicaciones'][ubicacion.key]){
                este.ruta[sede.key]['ubicaciones'][ubicacion.key]['subUbicaciones']=ubicacion.val();
              }
              ubicacion.forEach(subUbicacion=>{
                // console.log(este.ruta[sede.key].nombre)
                if(este.ruta[sede.key]['ubicaciones'][ubicacion.key] && este.ruta[sede.key]){
                  este.ruta['subUbicaciones'][subUbicacion.key]={
                    nombre:subUbicacion.val().nombre,
                    sede:{
                      key:sede.key,
                      nombre:este.ruta[sede.key].nombre
                    },
                    ubicacion:{
                      key:ubicacion.key,
                      nombre:este.ruta[sede.key]['ubicaciones'][ubicacion.key].nombre
                    }
                  }
                }
              })
            })
          })
        })
      })
    });
    firebase.database().ref('articulos').once('value',articulos=>{
      este.ruta['articulos'] = {};
      este.ruta['articulos'] = articulos.val();
      articulos.forEach(articulo=>{
        // let n = String(articulo.val().nombre).toUpperCase()
        este.ruta['articulos'][String(articulo.val().nombre).toUpperCase()] = {
          nombre: articulo.val().nombre,
          key: articulo.key
        };
      })
    })
    console.log('Rutas',este.ruta)
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
  NewContador(){
    let este = this;
    let conta = 0
    let bueno = 0
    let malo = 0
    let regular = 0
    firebase.database().ref('articulos').once('value', async articulos =>{
      await articulos.forEach(articulo=>{
        firebase.database().ref('inventario').orderByChild("articulo").equalTo(articulo.key).once('value', function(QueryArticulosSnapshot) {
          // actualizo el contado del articulo
          conta += QueryArticulosSnapshot.numChildren();
          QueryArticulosSnapshot.forEach(qa=>{
            switch (qa.val().estado) {
              case 'Bueno':
                  if(qa.child('buenos').exists()){
                    bueno = qa.val().buenos + 1;
                  }else{
                    bueno = 1;
                  }
                  firebase.database().ref('articulos').child(qa.key).update({
                    cantidad:QueryArticulosSnapshot.numChildren(),
                    buenos: bueno,
                  }).then(r=>{
                    console.log(conta)
                    console.log(qa.val())
                  })
                break;
              case 'Malo':
                  if(qa.child('malos').exists()){
                    malo = qa.val().malos + 1;
                  }else{
                    malo = 1;
                  }
                  firebase.database().ref('articulos').child(qa.key).update({
                    cantidad:QueryArticulosSnapshot.numChildren(),
                    malos: malo,
                  }).then(r=>{
                    console.log(conta)
                    console.log(qa.val())
                  })
              break;
              case 'Regular':
                  if(qa.child('regulares').exists()){
                    regular = qa.val().regulares + 1;
                  }else{
                    regular = 1;
                  }
                  firebase.database().ref('articulos').child(qa.key).update({
                    cantidad:QueryArticulosSnapshot.numChildren(),
                    regulares: regular
                  }).then(r=>{
                    console.log(conta)
                    console.log(qa.val())
                  })
              break;
              default:
                break;
            }
          })
          // console.log('Actualizado',articulo.val().nombre,' cantidad: ',QueryArticulosSnapshot.numChildren())
        });
      })
    })
    /* firebase.database().ref('inventario').orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
      este.inventario['buenos'] = BuenoSnapshot.numChildren();
      // console.log('b',este.inventario)
    });
    firebase.database().ref('inventario').orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
      este.inventario['malos'] = MaloSnapshot.numChildren();
      // console.log('m',este.inventario)
    });
    firebase.database().ref('inventario').orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
      este.inventario['regulares'] = RegularSnapshot.numChildren();
      // console.log('r',este.inventario)
    }); */
  }
  ReordenaDatabase(){
    let este = this;
    this.newData = {};
    este.newData['ubicaciones'] = {};
    este.newData['subUbicaciones'] = {};
    este.newData['inventario'] = {};
    for(let sedekey in this.dataBase['sedes']){
      este.newData['ubicaciones'] = Object.assign(este.newData['ubicaciones'],this.dataBase['ubicaciones'][sedekey])
      for(let ubicacionkey in this.dataBase['ubicaciones'][sedekey]){
        este.newData['subUbicaciones'] = Object.assign(este.newData['subUbicaciones'],this.dataBase['subUbicaciones'][ubicacionkey])
        este.newData['ubicaciones'][ubicacionkey]['sede'] = sedekey
        for(let subUbicacionkey in this.dataBase['subUbicaciones'][ubicacionkey]){
          este.newData['subUbicaciones'][subUbicacionkey]['sede'] = sedekey
          este.newData['subUbicaciones'][subUbicacionkey]['ubicacion'] = ubicacionkey
        }
      }
    }
    for(let subkey in this.dataBase['inventario']){
      este.newData['inventario'] = Object.assign(este.newData['inventario'],this.dataBase['inventario'][subkey])
      for(let invkey in this.dataBase['inventario'][subkey]){
        este.newData['inventario'][invkey]['sede'] = this.dataBase['inventario'][subkey][invkey]['sede'].key
        este.newData['inventario'][invkey]['ubicacion'] = this.dataBase['inventario'][subkey][invkey]['ubicacion'].key
        este.newData['inventario'][invkey]['subUbicacion'] = subkey
        este.newData['inventario'][invkey]['articulo'] = this.dataBase['inventario'][subkey][invkey]['articulo'].key
      }
    }
    firebase.database().ref().update(este.newData)
    console.log('Rutas',este.newData)
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
      let ubi = {};
      await subUbicaciones.forEach(subUbicacion => {
        console.log('Entro en home a: firebase.database().ref(inventario)')
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
          console.log('Entro en home a: firebase.database().ref(inventario/+subUbicacion.key).orderByChild("estado").equalTo(Bueno)')
          este.inventario['articulos']['buenos']['cantidad'] += BuenoSnapshot.numChildren();
          este.inventario['articulos']['total']['cantidad'] += BuenoSnapshot.numChildren();
          // este.inventario['articulos']['buenos']['articulosObj'] = Object.assign(este.inventario['articulos']['buenos']['articulosObj'], BuenoSnapshot.val());
          // este.inventario['articulos']['total']['articulosObj'] = Object.assign(este.inventario['articulos']['total']['articulosObj'], BuenoSnapshot.val());
          // BuenoSnapshot.forEach(data=>{
          //   let artdata = {};
          //   artdata = data.val();
          //   artdata['key'] = data.key
          //   este.inventario['articulos']['buenos']['articulosArray'].push(artdata)            
          // })
          // console.log('b',este.inventario)
        });
        firebase.database().ref('inventario/'+subUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
          console.log('Entro en home a: firebase.database().ref(inventario/+subUbicacion.key).orderByChild("estado").equalTo(Malo)')
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
          console.log('Entro en home a: firebase.database().ref(inventario/+subUbicacion.key).orderByChild("estado").equalTo(Regular)')
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
  }
  async resumenes(subUbicacionId){
    let este = this;
    let art = {}
    await firebase.database().ref('inventario/'+subUbicacionId).once('value',articulos=>{
      articulos.forEach(articulo => {
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
      firebase.database().ref('resumenes/'+subUbicacionId).set(este.inventario['articulos unicos'])
      console.log(este.inventario['articulos unicos'])
    })
  }
  corregir(){
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
    console.log('error',error)
    este.ruta['articulos con nombre errado'] = [];
    firebase.database().ref('inventario').once('value',async subUbicaciones=>{
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
                console.log(ingreso.val())
              })
            })
          })

          if(este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()]){
            firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
            .child('articulo').set(este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()])
          }else{
            // ----- si el articulo no existe --------------
            console.log('error: ',ingreso.val().nombre,este.ruta['articulos'][String(ingreso.val().nombre).toUpperCase()])
            if(este.ruta['articulos'][String(error[ingreso.val().nombre].corregir).toUpperCase()]){
              firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
              .child('articulo').set(este.ruta['articulos'][String(error[ingreso.val().nombre].corregir).toUpperCase()]) 
            }else{
              este.ruta['articulos con nombre errado'].push(ingreso.val());
              console.log('articulos con nombre errado',este.ruta['subUbicaciones'][subUbicacion.key],ingreso.val())
            }
          }
        })
      })
    })
    console.log('Rutas Corregidas',este.ruta)
  }
  corregirFechaCreacion(){
    let este = this;
    firebase.database().ref('inventario').once('value',async subUbicaciones=>{
      await subUbicaciones.forEach(subUbicacion=>{
        subUbicacion.forEach(ingreso=>{
          este.timestamp = new Date(este.decodeFbPushId(ingreso.key)).toLocaleDateString();
          firebase.database().ref('inventario').child(subUbicacion.key).child(ingreso.key)
          .child('creacion').set(este.timestamp)
        })
      })
    })
  }
  deleteFCloud(){
    let deleteF = firebase.functions().httpsCallable("deleteF");
    deleteF('184kFAcimERukjy6zCKC6qoSvqUouGEP_').then(function(reponse) {
      // Read result of the Cloud Function.
      console.log('Archivo eliminado: ',reponse);
      // ...
    }).catch(function(error) {
      // Read result of the Cloud Function.
      console.log('Archivo eliminado error: ',error);
      // ...
    })
  }
  async cloudf(){
    let data = {}
    data['sede'] = 'Mega2';
    data['ubicacion'] = 'ubicacion0';
    data['subUbicacion'] = 'subUbicacion1';
    data['estado'] = 'Bueno'
    data['fila'] = '1'
    data['nombre'] = 'Mi articulo'
    data['titulo'] = "Etiqueta de elemento "+data['fila']+" - "+data['nombre']
    let etiquetas = firebase.functions().httpsCallable("createLabels");
    await etiquetas(data).then(function(contrato) {
      // Read result of the Cloud Function.
      console.log('Etiqueta creado: ',contrato);
      // ...
    }).catch(function(error) {
      // Read result of the Cloud Function.
      console.log('Etiqueta error: ',error);
      // ...
    })
  }
  async uploadDB(){
    let este = this;
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    for(let i in this.json){
      // --- Formatin data ---------
        this.inventario[i] = {
          imagen: this.json[i]['Imagen'],
          tipo: this.json[i]['Tipo de elemento'],
          etiqueta: this.json[i]['Etiqueta'],
          ingreso: this.json[i]['Marca temporal'],
          email: this.json[i]['Dirección de correo electrónico'],
          nombre: this.json[i]['Nombre del articulo'],
          cantidad: this.json[i]['Cantidad'],
          disponibilidad: this.json[i]['Disponible para su uso'],
          estado: this.json[i]['estado'],
          descripcion: this.json[i]['Descripción'],
          observaciones: this.json[i]['Observaciones'],
          valor: this.json[i]['Valor unitario'],
          serie: this.json[i]['Serie'],
          sede: this.json[i]['Sede'],
          ubicacion: this.json[i]['Ubicación'],
          subUbicacion: this.json[i]['Sub-Ubicación']
        }
      // ---------------------------
      let toSearch = this.json[i]['Sede'];
      let datos = this.dataBase.sedes;
      let sedekey = this.buscakey(datos,toSearch)
      toSearch = this.json[i]['Ubicación'];
      datos = this.dataBase.ubicaciones[sedekey];
      let ubicacionkey = this.buscakey(datos,toSearch)
      toSearch = this.json[i]['Sub-Ubicación'];
      datos = this.dataBase.subUbicaciones[ubicacionkey];
      let subUbicacionkey = this.buscakey(datos,toSearch)
      if(sedekey == undefined || ubicacionkey == undefined || subUbicacionkey == undefined){
        console.log(
          'item',i,
          'sede',sedekey,
          'ubicacion',ubicacionkey,
          'sub-ubicacion',subUbicacionkey
        )
      }
      firebase.database().ref('inventario/'+subUbicacionkey).push(este.inventario[i])
      /* firebase.database().ref('subUbicaciones').child(ubicacionkey).child(subUbicacionkey).once('value', function(subUbicacionSN) {
        este.cantidad = 0;
        este.cantidad = subUbicacionSN.val().cantidad;
        firebase.database().ref('inventario/'+subUbicacionkey).push(este.inventario[i]).then(()=>{
          este.cantidad += 1;
          console.log(
            'item',i,
            'sede',este.dataBase.sedes[sedekey].nombre,
            'ubicacion',este.dataBase.ubicaciones[sedekey][ubicacionkey].nombre,
            'sub-ubicacion',este.dataBase.subUbicaciones[ubicacionkey][subUbicacionkey].nombre,
            'cantidad: ',este.cantidad
          )
          firebase.database().ref('subUbicaciones').child(ubicacionkey).child(subUbicacionkey).child('cantidad').set( este.cantidad )
        })
      }) */
    }
    loading.dismiss();
  }
  descargaDB(){
    let este = this;
    // window.open("https://inventario-denzil-escolar.firebaseio.com/.json",'_blank');//, 'location=yes'
    firebase.database().ref().once('value', function(Snapshot) {
      let childData = Snapshot.val();
      let obj = Snapshot.toJSON();
      // https://inventario-denzil-escolar.firebaseio.com/.json
      let exportData = 'data:text/json;charset=utf-8,';
      exportData += escape(JSON.stringify(obj));
      let encodedUri = encodeURI(exportData);
      window.open(encodedUri);
      console.log('entro root',obj)
    });
  }
  // --- Buscar en Objeto ----
    // ---- mi funcion -------
      buscakey(datos,toSearch){
        for(let key in datos){
          let values = Object.values(datos[key])
          if(values.indexOf(toSearch)>-1){
            // console.log('key: ',i,'value: ',toSearch)
            return key
          }
        }
      }
    // -----------------------
      searchFor(objects,toSearch) {
        let results = [];
        toSearch = this.trimString(toSearch); // trim it
        for(let i=0; i<objects.length; i++) {
          for(let key in objects[i]) {
            if(objects[i][key].indexOf(toSearch)!=-1) {
              if(!this.itemExists(results, objects[i])) results.push(objects[i]);
            }
          }
        }
        return results;
      }
      trimString(s) {
        let l=0, r=s.length -1;
        while(l < s.length && s[l] == ' ') l++;
        while(r > l && s[r] == ' ') r-=1;
        return s.substring(l, r+1);
      }
      compareObjects(o1, o2) {
        let k = '';
        for(k in o1) if(o1[k] != o2[k]) return false;
        for(k in o2) if(o1[k] != o2[k]) return false;
        return true;
      }
      itemExists(haystack, needle) {
        for(let i=0; i<haystack.length; i++) if(this.compareObjects(haystack[i], needle)) return true;
        return false;
      }
  // -------------------------
  async update(){
    /* let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    firebase.database().ref('inventario/'+este.SubUbicacion.key+'/'+este.articulo.key).update({
      nombre: este.articulo.nombre,
      cantidad: 1,
      disponibilidad: este.newIngresoForm.value.disponibilidad,
      estado: este.newIngresoForm.value.estado,
      descripcion: este.newIngresoForm.value.descripcion,
      observaciones: este.newIngresoForm.value.observaciones,
      valor: este.newIngresoForm.value.valor,
      serie: este.newIngresoForm.value.serie,
      sede: este.sede,
      ubicacion: este.ubicacion,
      subUbicacion: este.SubUbicacion,
    }).then(()=>{
      loading.dismiss()
      este.navCtrl.navigateBack(['inventario-sububicacion',{ 
        articuloNombre: este.articulo.nombre,
        articulokey: este.articulo.key,
        SubUbicacionNombre: este.SubUbicacion.nombre,
        SubUbicacionkey: este.SubUbicacion.key,
        ubicacionNombre: este.ubicacion.nombre,
        ubicacionkey: este.ubicacion.key,
        sede: este.sede
      }]);
    }) */
  }
  camara(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     let options = {
      uri: imageData,
      quality: 60,
      width: 300,
      height: 450
     } as ImageResizerOptions;
     
     this.imageResizer
       .resize(options)
       .then((filePath: string) => {
         this.Path = filePath;
          this.file.resolveLocalFilesystemUrl(filePath).then((entry:any)=>{
              entry.file((file1)=>{
              var reader = new FileReader();
              reader.onload =  (encodedFile: any)=>{
                var src = encodedFile.target.result;
                this.Path = src;
              }
              reader.readAsDataURL(file1);   
            })
          }).catch((error)=>{
            console.log(error);
          })
         console.log('FilePath => ', filePath)
        })
       .catch(e => console.log(e));

    }, (err) => {
     // Handle error
     console.log(err)
    });
  }
  startUpload(Path){
    const imagenes = firebase.storage().ref('inventario');
    imagenes.putString(Path,'data_url')
  }
  escaner(){
    this.barcodeScanner.scan().then(barcodeData => {
      this.scanData = barcodeData;
      console.log('Barcode data', barcodeData);
    }).catch(err => {
      console.log('Error', err);
    });
  }
  //var csv is the CSV file with headers
  csvJSON(csv){

    var lines=csv.split("\n");

    var result = [];

    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
  }
}
