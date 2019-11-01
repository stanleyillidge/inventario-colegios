import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, ToastController, LoadingController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import "firebase/functions";
import { Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-inventario-sububicacion',
  templateUrl: './inventario-sububicacion.page.html',
  styleUrls: ['./inventario-sububicacion.page.scss'],
})
export class InventarioSububicacionPage implements OnInit {
  @ViewChild('searchbar') inputElRef;
  
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
  toggled: boolean = false;
  sheetData: any = {};
  plataforma: any = {};
  translate: any;
  ingresos: {};
  cantidad: number;
  scanData: { subkey: string; artkey: string; };
  PUSH_CHARS:string = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  parametros: any = [];
  ArticuloChild: string;
  constructor(
    public platform: Platform,
    public route: ActivatedRoute,
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
    this.SubUbicacion['nombre'] = this.route.snapshot.paramMap.get('SubUbicacionNombre')
    this.SubUbicacion['key'] = this.route.snapshot.paramMap.get('SubUbicacionkey')
    this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
    this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    this.ArticuloChild = 'inventario/'+this.SubUbicacion.key;
    this.parametros['old'] = {
      ArticuloChild: this.ArticuloChild,
      SubUbicacionNombre: this.SubUbicacion['nombre'],
      SubUbicacionkey: this.SubUbicacion['key'],
      ubicacionNombre: this.ubicacion['nombre'],
      ubicacionkey: this.ubicacion['key'],
      sedeNombre: this.sede['nombre'],
      sedekey: this.sede['key'],
    }
    // this.titulo
    este.inventario['numArticulos'] = 0;
    este.inventario['buenos'] = 0;
    este.inventario['malos'] = 0;
    este.inventario['regulares'] = 0;
    this.toggled = false;
    este.translate = JSON.parse(localStorage.getItem('translate'))
    
    // ---- Organizar con el nuevo esquema -----
      /* este.ingresos = {}
      este.translate = JSON.parse(localStorage.getItem('translate'))
      firebase.database().ref('ubicaciones2').once('value',(data0)=>{
        este.translate.ubicaciones = data0.val();
      }).then(()=>{
        firebase.database().ref('subUbicaciones2').once('value',(data1)=>{
          este.translate.subUbicaciones = data1.val();
        }).then(()=>{
          firebase.database().ref('articulos').once('value',articulos=>{
            este.translate['articulos'] = {};
            este.translate['articulos'] = articulos.val();
            articulos.forEach(articulo=>{
              este.translate['articulos'][String(articulo.val().nombre).toUpperCase()] = {
                nombre: articulo.val().nombre,
                key: articulo.key
              };
            })
          }).then(()=>{
            let codigo
            console.log("Comienza",este.translate)
            localStorage.setItem('translate', JSON.stringify(este.translate))
            firebase.database().ref('inventario').once('value',(data2)=>{
              data2.forEach(subUbicacion =>{
                este.cantidad = 0;
                subUbicacion.forEach(ingreso =>{
                  este.cantidad += 1;
                  codigo = este.translate.sedes[ingreso.val().sede['key']].codigo + este.translate.ubicaciones[ingreso.val().ubicacion['key']].codigo + este.translate.subUbicaciones[subUbicacion['key']].codigo + '-0' + este.cantidad
                  este.ingresos[ingreso.key] = ingreso.val();
                  switch (ingreso.val().nombre) {
                    case 'Silla plástica con descansa brazo':
                      este.ingresos[ingreso.key].nombre = 'Silla plastica con descansa brazo'
                      if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                      }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                      }
                      break;
                    case "Bombilla de 100 voltios ":
                      este.ingresos[ingreso.key].nombre = "Bombilla de 100 voltios"
                      if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                      }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                      }
                      break;
                    // case "Silla PLASTICA PEQUEÑA sin descansa brazo":
                    //   este.ingresos[ingreso.key].nombre = "Bombilla de 100 voltios"
                    //   if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                    //     este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                    //   }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                    //     este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                    //   }
                    //   break;
                    case "Estufa a gas de dos fogones ":
                      este.ingresos[ingreso.key].nombre = "Estufa a gas de dos fogones"
                      if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                      }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                      }
                      break;
                    case "Gabinete Metálico Aéreo ":
                      este.ingresos[ingreso.key].nombre = "Estufa a gas de dos fogones"
                      if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                      }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                      }
                      break;
                    default:
                      if(este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][String(este.ingresos[ingreso.key].nombre).toUpperCase()].key
                      }else if(este.translate['articulos'][este.translate['articulos'][ingreso.val().articulo.key]]){
                        este.ingresos[ingreso.key]['articulo'] = este.translate['articulos'][ingreso.val().articulo.key].key
                      }else{
                        // errores en los nombres o keys del articulo que representa el objeto
                        console.log(ingreso.key,ingreso.val())
                      }
                      break;
                  }
                  este.ingresos[ingreso.key]['key'] = ingreso.key;
                  este.ingresos[ingreso.key]['codigo'] = codigo;
                  este.ingresos[ingreso.key]['sede'] = ingreso.val().sede['key'];
                  este.ingresos[ingreso.key]['ubicacion'] = ingreso.val().ubicacion['key'];
                  este.ingresos[ingreso.key]['subUbicacion'] = subUbicacion['key'];
                  // new Date(este.decodeFbPushId(j)).toLocaleDateString();
                })
              })
            }).then(()=>{
              firebase.database().ref('inventario2').set(este.ingresos).then(()=>{
                console.log('Termino!!',este.ingresos)
              })
            })
          })
        })
      }) */
    // -----------------------------------------
    // ---- Nueva forma de leer los datos ------
      this.resumen();
      este.cantidad = 0;
      este.articulos = [];
      este.articulost = []; 
      este.inventario['detallado'] = [];
      este.inventario['articulos unicos'] = [];
      firebase.database().ref('inventario2').orderByChild("subUbicacion").equalTo(this.SubUbicacion['key']).on('child_added',async (added)=>{
        console.log('Articulo added',added.val())
        // ------ Resumen -----------------------------
          este.inventario['numArticulos'] += 1;
          let inv = added.val();
          inv['nombre'] = este.translate.articulos[added.val().articulo].nombre;
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
          este.articulosUnicos();
        // --------------------------------------------
      });
      // ojo hacer desde cloud functions
      firebase.database().ref('inventario2').orderByChild("subUbicacion").equalTo(this.SubUbicacion['key']).on('child_changed', function(change){
        for(let i in este.articulos){
          if(este.articulos[i].key == change.key){
            console.log('Inventario Change',change.val(),change.key)
            let inv = change.val();
            inv['nombre'] = este.translate.articulos[change.val().articulo].nombre;
            este.articulos[i] = inv;
            este.articulosUnicos();
            break;
          }
        }
      });
      // ojo hacer desde cloud functions
      firebase.database().ref('inventario2').orderByChild("subUbicacion").equalTo(this.SubUbicacion['key']).on('child_removed', function(removed){
        console.log('Data removed',removed.val())
        for(let i in este.articulos){
          if(este.articulos[i].key == removed.key){
            este.inventario['numArticulos'] -= 1;
            este.articulos.splice(i, 1);
            este.articulosUnicos();
            break
          }
        }
      });
      console.log('translate',este.translate)
      console.log('articulos unicos: ',este.articulos,este.inventario)
    // -----------------------------------------
    // -------------------------------------------------
      /* firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Bueno').on('value', function(BuenoSnapshot) {
        // console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Bueno)')
        este.inventario['buenos'] = BuenoSnapshot.numChildren();
        // console.log('b',este.inventario)
      });
      firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Malo').on('value', function(MaloSnapshot) {
        // console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Malo)')
        este.inventario['malos'] = MaloSnapshot.numChildren();
        // console.log('m',este.inventario)
      });
      firebase.database().ref('inventario/'+this.SubUbicacion.key).orderByChild("estado").equalTo('Regular').on('value', function(RegularSnapshot) {
        // console.log('Entro en inventario-sububicacion a: firebase.database().ref(inventario/+this.SubUbicacion.key).orderByChild("estado").equalTo(Regular)')
        este.inventario['regulares'] = RegularSnapshot.numChildren();
        // console.log('r',este.inventario)
      });
      firebase.database().ref('articulos').on('value',articulos=>{
        // console.log('Entro en inventario-sububicacion a: firebase.database().ref(articulos)')
        este.nombresArt = articulos.val();
        // console.log('Nombres: ',este.nombresArt)
        este.cargaDataVistaFontral()
      }) */
    // -------------------------------------------------
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
  articulosUnicos(){
    let este = this;
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
    este.inventario['articulos unicos']['sede'] = este.sede
    este.inventario['articulos unicos']['ubicacion'] = este.ubicacion
    este.inventario['articulos unicos']['SubUbicacion'] = este.SubUbicacion
    este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
    este.articulost = este.articulos;
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
      este.inventario['detallado'] = [];
      articulosnapshot.forEach(articulo => {
        // console.log(articulo.val())
        art = articulo.val();
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
      // firebase.database().ref('resumenes').child(este.SubUbicacion.key).set(este.inventario['articulos unicos'])
      este.inventario['articulos unicos temp'] = este.inventario['articulos unicos']
      console.log('articulos unicos: ',este.inventario['articulos unicos'])
      este.articulost = este.articulos;
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
        // let data = este.sheetData
      /* // ---- ordena tabla para docs -----------------------------------
        const rowH = 54;
        const startIndex = 905;
        const endIndex = (este.sheetData.values.length * rowH) + startIndex + este.sheetData.values.length; //1665;
        let celdas = [];
        let celda = {};
        let index = startIndex - 1
        for(let i = 0; i < data.values.length - 3; i++){
          for(let j = 0; j < data.values[i].length; j++){
            celda = {}
            let textLength = 1;
            if((j < 0) && (data.values[i][j].length)){
              textLength = data.values[i][j].length;
            }
            index += 1
            celda['insertText'] = {
              'location': {
                'index': index
              },
              'text': String(data.values[i][j])
            }
            celdas.push(celda)
          }
        }
        let tabla = {
          "startIndex": startIndex,
          "endIndex": endIndex - 1,
          table: {
            columns: este.sheetData.values[0].length,
            rows: este.sheetData.values.length,
            celdas: celdas
          }
        }
        let document = {}
        document['titulo'] = este.SubUbicacion.nombre
        document['tabla'] = tabla//JSON.stringify(tabla.table)
        console.log('Tabla Doc',document)
        /* let tabla = {
          "startIndex": startIndex - 1,
          "endIndex": endIndex - 1,
          table: {
            columns: este.sheetData.values[0].length,
            rows: este.sheetData.values.length,
            tableRows: []
          }
        }
        let tableCells = []
        let content = []
        let paragraph = {}
        for(let i = 0; i < data.values.length - 3; i++){
          tableCells = []
          for(let j = 0; j < data.values[i].length; j++){
            // console.log(i,j,'celda:',data.values[i][j])
            let textLength = 1;
            if(data.values[i][j].length){
              textLength = data.values[i][j].length;
            }
            console.log(i,j,'textLength:',textLength,data.values[i][j])
            content = []
            paragraph = {}
            paragraph['elements'] = []
            paragraph['elements'].push({
              startIndex: startIndex + Number(i) + (rowH * Number(i)) + 2,
              endIndex: (startIndex + Number(i) + (rowH * Number(i)) + 2) + textLength,
              "textRun": {
                "content": data.values[i][j],
                "textStyle": {
                  "bold": false,
                  "fontSize": {
                    "magnitude": 12,
                    "unit": "PT"
                  }
                }
              }
            });
            content.push({
                startIndex: startIndex + Number(i) + (rowH * Number(i)) + 2,
                endIndex: (startIndex + Number(i) + (rowH * Number(i)) + 2) + textLength + 1,
                paragraph: paragraph
            });
            tableCells.push({
              startIndex: startIndex + Number(i) + (rowH * Number(i)) + 1,
              endIndex: (startIndex + Number(i) + (rowH * Number(i)) + 2) + textLength + 1,
              content: content
            });
          }
          tabla.table.tableRows.push({
            "startIndex": startIndex + Number(i) + (rowH * Number(i)),
            "endIndex": (startIndex + Number(i) + (rowH * Number(i))) + rowH,
            tableCells:tableCells
          })
        }
        let document = {}
        document['titulo'] = este.SubUbicacion.nombre
        document['tabla'] = tabla//JSON.stringify(tabla.table)
        console.log('Tabla Doc',document) */
      // --------------------------------------------------------------- */
    }
    inventarioRef.on('value', carga);
  }
  async sheet(){
    if(this.sheetData['url']){
      window.open(this.sheetData.url,'_blank');
    }else{
      // ---------------------------------------------------------------
        let este = this
        const loading2 = await this.loadingController.create({
          message: '...Generando archivo de resumen en Google Sheets...'
        });
        await loading2.present();
        este.sheetData = [];
        este.sheetData['values'] = [];
        este.sheetData['detallado'] = este.inventario['detallado'];
        este.sheetData['titulo'] = este.translate.subUbicaciones[este.SubUbicacion['key']].nombre;
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
        let exportaFS = firebase.functions().httpsCallable("exportaFS");
        exportaFS(this.sheetData).then(async function(response) {
          // Read result of the Cloud Function.
          await console.log('Archivo creado: ',response);
          este.sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
          let message = 'El resumen fué creado'
          este.presentToastWithOptions(message,3000,'top')
          loading2.dismiss()
          window.open(este.sheetData.url,'_blank');
        }).catch(function(error) {
          // Read result of the Cloud Function.
          loading2.dismiss()
          console.log('Error en crear Archivo: ',error);
          este.presentToastWithOptions(error.message,3000,'top')
        })
      // ---------------------------------------------------------------
    }
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
  Etiqueta(articulo){
    window.open(articulo.etiqueta,'_blank');
  }
  open(articulo){
    let data = { 
      articuloNombre: articulo.nombre,
      articulokey: articulo.key,
      SubUbicacionNombre: this.SubUbicacion.nombre,
      SubUbicacionkey: this.SubUbicacion.key,
      ubicacionNombre: this.ubicacion.nombre,
      ubicacionkey: this.ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
    }
    // console.log(articulo,'Se abrirá',data)
    this.navCtrl.navigateForward(['view-articulo',data]);
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
  async RemoveArticulo(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la articulo '+este.translate.articulos[articulo.articulo].nombre+' !!!',
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
            this.remueveArticulo(articulo).then(()=>{
              localStorage.removeItem("ingreso");
              este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
            })
          }
        }
      ]
    });

    await alert.present();
  }
  async remueveArticulo(articulo){
    let este = this
    console.log('Entro en remueveArticulo',articulo)
    return firebase.database().ref('inventario2').child(articulo.key).remove()
    .then(()=>{
      // ---- Leo la cantidad en la subUbicacion -----------------------------------
      firebase.database().ref('subUbicaciones2').child(articulo.subUbicacion)
      .child('cantidad').once('value',sub=>{
        let subnc = sub.val() - 1;
        // ---- Escribo la nueva cantidad en la subUbicacion -----------------------
        firebase.database().ref('subUbicaciones2').child(articulo.subUbicacion)
        .child('cantidad').set(subnc)
      }).then(()=>{
        // ---- Leo la cantidad en la Ubicacion -----------------------------------
        firebase.database().ref('ubicaciones2').child(articulo.ubicacion)
        .child('cantidad').once('value',u=>{
          let unc = u.val() - 1;
          // ---- Escribo la nueva cantidad en la Ubicacion -----------------------
          firebase.database().ref('ubicaciones2').child(articulo.ubicacion)
          .child('cantidad').set(unc)
        }).then(()=>{
          // ---- Leo la cantidad en la sede -----------------------------------
          firebase.database().ref('sedes').child(articulo.sede)
          .child('cantidad').once('value',s=>{
            let snc = s.val() - 1;
            // ---- Escribo la nueva cantidad en la sede -----------------------
            firebase.database().ref('sedes').child(articulo.sede)
            .child('cantidad').set(snc)
            // ---- Borro la etiqueta del articulo -----------------------------
            este.deleteFCloud(articulo.etiquetaId).then(async ()=>{
              localStorage.removeItem("ingreso");
              console.log('Articulo y Etiqueta de articulo eliminados')
              localStorage.removeItem("ingreso");
              este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
            })
          })
        })
      })
    })
  }
  async deleteFCloud(key){
    let deleteF = firebase.functions().httpsCallable("deleteF");
    return await deleteF(key).then(function(reponse) {
      // Read result of the Cloud Function.
      console.log('Archivo eliminado: ',reponse);
      // ...
    }).catch(function(error) {
      // Read result of the Cloud Function.
      console.log('Archivo eliminado error: ',error);
      // ...
    })
  }
  async Removearticulo0(articulo){
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
  RemoveArticulo0(articulo){
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
              message: 'Creando etiqueta del articulo...'
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