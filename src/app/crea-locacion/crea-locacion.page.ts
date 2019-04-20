/* import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crea-locacion',
  templateUrl: './crea-locacion.page.html',
  styleUrls: ['./crea-locacion.page.scss'],
})
export class CreaLocacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
 */
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, ToastController } from '@ionic/angular';
import { Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer/ngx';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-crea-locacion',
  templateUrl: './crea-locacion.page.html',
  styleUrls: ['./crea-locacion.page.scss'],
})
export class CreaLocacionPage implements OnInit {
  // ---------------------------
    newIngresoForm: FormGroup;
    articulos:any=[]
    articulost:any
    articulosKeys:any=[]
    sede:any={};
    ubicacion:any={};
    SubUbicacion:any={};
    //-------------------
    esquemaDB:any={};
    sedes:any=[];
    ubicaciones:any;
    SubUbicaciones:any;
    parametros:any = {};
    //-------------------
    articulo:any={};
    titulo;
    scanData;
    Path:any="/assets/shapes.svg";
    base64Image;
    numArt:any=0;
    plataforma:any=[];
    imagen: File = null;
    NewArticulo: any = {};
    ArticuloChild: string;
    NewArticuloChild: string;
    updatekey: string;
    extension: any;
    locacion: any = {};
    locaciones: any = [];
  // ---------------------------
  constructor(
    public platform: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    private http: Http,
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    private imageResizer: ImageResizer,
    private file: File,
    public fb: FormBuilder,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private _cdr: ChangeDetectorRef
  ) {
    // ----------------------------------------------------
      let este = this
      this.plataforma.desktop = this.platform.is("desktop");
      this.plataforma.android = this.platform.is("android");

      this.locacion['accion'] = this.route.snapshot.paramMap.get('accion')
      this.locacion['nombre'] = this.route.snapshot.paramMap.get('locacionNombre')
      this.locacion['child'] = this.route.snapshot.paramMap.get('locacionChild')
      this.locacion['key'] = this.route.snapshot.paramMap.get('locacionkey')

      this.NewArticulo['nombre'] = this.route.snapshot.paramMap.get('NewArticuloNombre')
      this.NewArticulo['key'] = this.route.snapshot.paramMap.get('NewArticulokey')
      this.articulo['nombre'] = this.route.snapshot.paramMap.get('articuloNombre')
      this.articulo['key'] = this.route.snapshot.paramMap.get('articulokey')
      this.SubUbicacion['nombre'] = this.route.snapshot.paramMap.get('SubUbicacionNombre')
      this.SubUbicacion['key'] = this.route.snapshot.paramMap.get('SubUbicacionkey')
      this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
      this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
      this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
      this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
      this.ArticuloChild = 'inventario/'+this.SubUbicacion.key+'/'+this.articulo.key;
      this.parametros['old'] = {
        ArticuloChild: this.ArticuloChild,
        NewArticuloNombre: this.NewArticulo['nombre'],
        NewArticulokey: this.NewArticulo['key'],
        articuloNombre: this.articulo['nombre'],
        articulokey: this.articulo['key'],
        SubUbicacionNombre: this.SubUbicacion['nombre'],
        SubUbicacionkey: this.SubUbicacion['key'],
        ubicacionNombre: this.ubicacion['nombre'],
        ubicacionkey: this.ubicacion['key'],
        sedeNombre: this.sede['nombre'],
        sedekey: this.sede['key'],
      }
      console.log(este.parametros['old'])
      este.titulo = este.sede.nombre +' / '+ este.ubicacion['nombre'] +' / '+ este.SubUbicacion.nombre
    //-----------------------------------------------------
      if(this.locacion.accion == 'crear'){
        this.locacion.key = firebase.database().ref(this.locacion.child).push().key;
        this.locacion.nombre = ''
        este.creaFormulario({
          nombre:'',
          descripcion:''
        })
      }else{
        firebase.database().ref(this.locacion.child).child(this.locacion.key).once('value',async (sedesSnap)=>{
          let a = {}
          a = sedesSnap.val()
          a['key'] = sedesSnap.key
          if(sedesSnap.val().imagen){
            este.Path = sedesSnap.val().imagen;
          }
          este.locaciones.push(a)
        }).then(a=>{
          este.creaFormulario(este.locaciones[0])
        })
      }
    // ----------------------------------------------------
  }
  creaFormulario(data){
    let este = this
    //-------------------
      console.log('data:',data)
      this.newIngresoForm = this.fb.group({
        nombre: new FormControl(data.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        descripcion: new FormControl(data.descripcion, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]))
      });
    //-------------------
    console.log('locaciones:',this.locaciones)
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
      quality: 100,
      width: 650,
      height: 445
     } as ImageResizerOptions;
     
     this.imageResizer
       .resize(options)
       .then((filePath: string) => {
         this.Path = filePath;
          this.file.resolveLocalFilesystemUrl(filePath).then((entry:any)=>{
              entry.file((file1)=>{
              let reader = new FileReader();
              reader.onload =  (encodedFile: any)=>{
                let src = encodedFile.target.result;
                this.Path = src;
                this.updateIamgen()
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
  onFile(e) {
    let este = this;
    this.imagen = <File>e.target.files[0];

    let reader = new FileReader();

    reader.onload = function(e) {
      let src = e.target["result"];
      este.Path = src;
      //------------------------------
      // Create Base64 Object
      let Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){let t="";let n,r,i,s,o,u,a;let f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){let t="";let n,r,i;let s,o,u,a;let f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");let t="";for(let n=0;n<e.length;n++){let r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){let t="";let n=0;let r=0; let c1=0; let c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);let c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

      // Define the string, also meaning that you need to know the file extension
      let encoded = src;

      // Decode the string
      let decoded = Base64.decode(encoded);
      // console.log(decoded);

      // if the file extension is unknown
      este.extension = undefined;
      // do something like this
      let lowerCase = decoded.toLowerCase();
      if (lowerCase.indexOf("png") !== -1) este.extension = "png"
      else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
          este.extension = "jpg"
      else este.extension = "tiff";
      //------------------------------
      // console.log(este.Path);
      este.updateIamgen();
      // console.log(este.myPhoto, src);
    };
    reader.readAsDataURL(e.target.files[0]);
  }
  escaner(){
    this.barcodeScanner.scan().then(barcodeData => {
      this.scanData = barcodeData.text;
      let data = this.newIngresoForm.value
      data['serie'] = barcodeData.text;
      // console.log('Barcode data', barcodeData);
      // console.log('Form data', data);
      this.creaFormulario(data)
    }).catch(err => {
      console.log('Error', err);
    });
  }
  onInput(ev:any){
    // Reset items back to all of the items
    // this.initializeItems();
    this.articulos = this.articulost;

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.articulos = this.articulos.filter((ubicacion) => {
        return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  /* async Editarticulo(articulo) {
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
            firebase.database().ref('articulos/'+this.ubicacion+'/'+este.articulosKeys[index]+'/nombre').set(d.articulo)
            // this.articulos[index]=d.articulo
            console.log('Edit Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  } */
  async updateIamgen() {
    let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    let child = this.sede.nombre+'/'+this.locacion.nombre
    const imagenes = firebase.storage().ref(child);
    let imagen
    if(this.plataforma.android){
      imagen = [este.Path,'data_url'];
    }else{
      let ext = "data:image/"+este.extension+";base64,/";
      console.log(este.extension,ext)
      if(este.extension == 'jpg'){
        console.log(este.extension)
        ext = "data:image/jpeg;base64,/";
      }
      let src = este.Path.substr(ext.length-1);
      imagen = [src,'base64'];
    }
    imagenes.putString(imagen[0],imagen[1]).then(function(snapshot) {
      console.log('Uploaded a data_url string!');
      imagenes.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        este.Path = url;
        if(este.locacion.nombre!=''){
          // hago copia de respaldo por modificación
          este.updatekey = firebase.database().ref('modificaciones').push().key
          console.log('ojo entro!',este.locacion.key,este.updatekey,url);
          firebase.database().ref('modificaciones').child(este.locacion.key).child(este.updatekey).set({
            imagen: url,
            modificacion: new Date().toLocaleString(),
            nombre: este.locacion.nombre,
            cantidad: este.locaciones[0].cantidad,
            descripcion: este.newIngresoForm.value.descripcion
          }).then(()=>{
          }).catch(function(error) {
            loading.dismiss()
            este.presentToastWithOptions('Error al guardar modificación',2000,'top')
            console.error('Error al guardar modificación',error)
          })
          console.log('Entro a guardar...')
          firebase.database().ref(este.locacion.child).child(este.locacion.key).update({
            imagen: url,
            modificacion: este.updatekey,
            nombre: este.locacion.nombre,
            cantidad: este.locaciones[0].cantidad,
            descripcion: este.newIngresoForm.value.descripcion
          }).then(()=>{
            loading.dismiss()
            este.presentToastWithOptions('Imagen actualizada',3000,'top')
          }).catch(function(error) {
            loading.dismiss()
            este.presentToastWithOptions('Error al guardar locacion',2000,'top')
            console.error('Error al guardar locacion',error)
          })
        }else{
          loading.dismiss()
        }
      }).catch(function(error) {
        loading.dismiss()
        este.presentToastWithOptions('Error al optener la url de la imagen',2000,'top')
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object-not-found':
            console.log('storage/object-not-found')
            // File doesn't exist
            break;
  
          case 'storage/unauthorized':
            console.log('storage/unauthorized')
            // User doesn't have permission to access the object
            break;
  
          case 'storage/canceled':
            console.log('storage/canceled')
            // User canceled the upload
            break;
  
          case 'storage/unknown':
            console.log('storage/unknown')
            // Unknown error occurred, inspect the server response
            break;
        }
      });
    }).catch(function(error) {
      loading.dismiss()
      este.presentToastWithOptions('Error al guardar imagen',2000,'top')
      console.error('Error al guardar imagen',error)
    })
  }
  async update(){
    let este = this
    if(este.newIngresoForm.value.nombre!=''){
      const loading = await this.loadingController.create({
        message: 'Actualizado...'
      });
      await loading.present();
      let cantidad = 0;
      if(this.locacion.accion != 'crear'){
        cantidad = este.locaciones[0].cantidad;
      }
      este.updatekey = firebase.database().ref('modificaciones').push().key
      firebase.database().ref('modificaciones').child(este.locacion.key).child(este.updatekey).set({
        imagen: este.Path,
        modificacion: new Date().toLocaleString(),
        nombre: este.newIngresoForm.value.nombre,
        cantidad: cantidad,
        descripcion: este.newIngresoForm.value.descripcion
      })
      firebase.database().ref(este.locacion.child).child(este.locacion.key).update({
        imagen: este.Path,
        modificacion: este.updatekey,
        nombre: este.newIngresoForm.value.nombre,
        cantidad: cantidad,
        descripcion: este.newIngresoForm.value.descripcion
      }).then(()=>{
        loading.dismiss()
        este.navCtrl.navigateBack([este.locacion.child,{
          SubUbicacionNombre: este.SubUbicacion.nombre,
          SubUbicacionkey: este.SubUbicacion.key,
          ubicacionNombre: este.ubicacion.nombre,
          ubicacionkey: este.ubicacion.key,
          sedeNombre: este.sede.nombre,
          sedekey: este.sede.key
        }]);
      })
    }else{
      const alert = await this.alertController.create({
        header: 'Error !',
        // subHeader: 'Subtitle',
        message: 'Debes digitar el nombre',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
  async Removearticulo(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la articulo '+articulo+' !!!',
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
            let index = this.articulos.indexOf(articulo)
            firebase.database().ref('articulos/'+this.ubicacion+'/'+este.articulosKeys[index]).remove()
            // this.articulos.splice(index, 1);
            // this.articulost = this.articulos;
            console.log('Eliminar Okay');
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