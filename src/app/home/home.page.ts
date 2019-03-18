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
    this.http.get('../../assets/data/data.json').subscribe(data => {
      this.json = JSON.parse(data.text());
    },err => console.log(err));

    this.http.get('../../assets/data/inventario-denzil-escolar-export.json').subscribe(data => {
      this.dataBase = JSON.parse(data.text());
    },err => console.log(err));
  }
  deleteFCloud(){
    let deleteF = firebase.functions().httpsCallable("deleteF");
    deleteF('1Eg11Qp3WdIJiy0aHfOeeXY97YquXm31G').then(function(reponse) {
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
