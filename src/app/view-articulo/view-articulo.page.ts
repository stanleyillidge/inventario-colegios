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
import "firebase/functions";
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-view-articulo',
  templateUrl: './view-articulo.page.html',
  styleUrls: ['./view-articulo.page.scss'],
})
export class ViewArticuloPage implements OnInit {
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
  PUSH_CHARS:string = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  Path:any="/assets/shapes.svg";
  base64Image;
  numArt:any=0;
  plataforma:any=[];
  imagen: File = null;
  NewArticulo: any = {};
  ArticuloChild: string;
  NewArticuloChild: string;
  updatekey: string;
  etiqueta: any[];
  timestamp: string | number | Date;
  translate: any;
  ingreso: any;
  onchange: any = [];
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
    let este = this
    this.plataforma.desktop = this.platform.is("desktop");
    this.plataforma.android = this.platform.is("android");
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
    this.onchange['new'] = [];
    this.onchange['old'] = [];
    this.ingreso = JSON.parse(localStorage.getItem('ingreso'))
    console.log('ingreso',this.ingreso)
    este.translate = JSON.parse(localStorage.getItem('translate'))
    console.log(este.translate,this.articulo,este.parametros['old'])
    // ---- Nueva forma de leer los datos ------
      este.articulos = [];
      if(!this.ingreso){
        firebase.database().ref('inventario2').child(this.articulo.key).once('value',(added)=>{
          console.log('Articulo added',added.val())
          // --------------------------------------------
            este.cargaInicial(added.val(),added.key)
          // --------------------------------------------
        });
      }else{
        este.cargaInicial(this.ingreso,this.ingreso.key)
      }
    // -----------------------------------------
  }
  cargaInicial(inv:any,key:any){
    let este = this;
    este.Path = inv.imagen;
    inv['nombre'] = este.translate.articulos[inv.articulo].nombre;
    inv['key'] = key;
    este.articulos = inv;
    este.sedes = [];
    este.ubicaciones = [];
    este.SubUbicaciones = [];
    for(let i in este.translate.sedes){
      este.sedes.push(este.translate.sedes[i])
    }
    for(let i in este.translate.ubicaciones){
      if(este.translate.ubicaciones[i].sede == este.articulos.sede){
        este.ubicaciones.push(este.translate.ubicaciones[i])
      }
    }
    for(let i in este.translate.subUbicaciones){
      if(este.translate.subUbicaciones[i].sede == este.articulos.sede){
        este.SubUbicaciones.push(este.translate.subUbicaciones[i])
      }
    }
    este.creaFormulario(este.articulos)
  }
  modificaNombre(){
    console.log(this.sede,this.ubicacion,this.SubUbicacion)
    localStorage.setItem('ingreso', JSON.stringify(this.articulos))
    this.navCtrl.navigateForward(['edita-path']);
  }
  onSedeChange(s){
    let este = this
    this.newIngresoForm.get('ubicacionfrm').setValue(null);
    this.newIngresoForm.get('subUbicacionfrm').setValue(null);
    this.ubicaciones = [];
    this.SubUbicaciones = null;
    for(let i in this.translate.sedes){
      if(this.translate.sedes[i].nombre == s.target.value){
        este.onchange['new']['sede'] = i;
        if(!este.onchange['old']['sede']){
          este.onchange['old']['sede'] = este.articulos.sede;
          este.onchange['old']['ubicacion'] = este.articulos.ubicacion;
          este.onchange['old']['subUbicacion'] = este.articulos.subUbicacion;
        }
        este.articulos.sede = i;
        este.articulos.ubicacion = null;
        este.articulos.subUbicacion = null;
        este.articulos.etiquetaId = null;
        for(let j in this.translate.ubicaciones){
          if(this.translate.ubicaciones[j].sede == this.translate.sedes[i].key){
            this.ubicaciones.push(this.translate.ubicaciones[j])
          }
        }
      }
    }
    console.log('onSedeChange:',s.target.value,this.translate,este.articulos,este.ubicaciones,este.SubUbicaciones)
    this._cdr.detectChanges();
  }
  onUbicacionChange(u){
    let este = this
    this.SubUbicaciones = [];
    this.newIngresoForm.get('subUbicacionfrm').setValue(null);
    for(let i in this.translate.ubicaciones){
      if((this.translate.ubicaciones[i].nombre == u.target.value) && (this.translate.ubicaciones[i].sede == este.articulos.sede)){
        este.onchange['new']['ubicacion'] = i;
        if(!este.onchange['old']['ubicacion']){
          este.onchange['old']['ubicacion'] = este.articulos.ubicacion;
        }
        este.articulos.ubicacion = i;
        este.articulos.subUbicacion = null;
        este.articulos.etiquetaId = null;
        for(let j in this.translate.subUbicaciones){
          if(this.translate.subUbicaciones[j].ubicacion == i){
            this.SubUbicaciones.push(this.translate.subUbicaciones[j])
          }
        }
        break;
      }
    }
    console.log('onUbicacionChange:',u.target.value,this.translate,este.articulos,este.ubicaciones,este.SubUbicaciones)
    this._cdr.detectChanges();
  }
  onSubUbicacionChange(sub){
    let este = this
    este.articulos.etiquetaId = null;
    for(let i in this.translate.subUbicaciones){
      if(this.translate.subUbicaciones[i].nombre == sub.target.value && (this.translate.subUbicaciones[i].ubicacion == este.articulos.ubicacion) && (this.translate.subUbicaciones[i].sede == este.articulos.sede)){
        este.onchange['new']['subUbicacion'] = i;
        if(!este.onchange['old']['subUbicacion']){
          este.onchange['old']['subUbicacion'] = este.articulos.subUbicacion;
        }
        este.articulos.subUbicacion = i;
      }
    }
    console.log('onSubUbicacionChange:',sub.target.value,this.translate,este.articulos,este.ubicaciones,este.SubUbicaciones)
    this._cdr.detectChanges();
  }
  creaFormulario(data){
    let este = this
    console.log('data:',data)
    console.log('data sede:',este.translate.sedes[data.sede].nombre)
    console.log('data ubicacion:',este.translate.ubicaciones[data.ubicacion].nombre)
    console.log('data subUbicacion:',este.translate.subUbicaciones[data.subUbicacion].nombre)
    //---------------------------------------------------------------------------------------
      this.newIngresoForm = this.fb.group({
        sedefrm: new FormControl(este.translate.sedes[data.sede].nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        ubicacionfrm: new FormControl(este.translate.ubicaciones[data.ubicacion].nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        subUbicacionfrm: new FormControl(este.translate.subUbicaciones[data.subUbicacion].nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        valor: new FormControl(data.valor, Validators.compose([
          // Validators.required,
          // Validators.maxLength(7),
          // Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        nombre: new FormControl(data.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        serie: new FormControl(data.serie, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        estado: new FormControl(data.estado, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        disponibilidad: new FormControl(data.disponibilidad, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        observaciones: new FormControl(data.observaciones, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        descripcion: new FormControl(data.descripcion, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        cantidad: new FormControl(data.cantidad, Validators.compose([
          // Validators.required,
          // Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]))
      });
    //---------------------------------------------------------------------------------------
    console.log('nombre:',this.newIngresoForm.get('nombre').value)
    console.log('sede:',this.newIngresoForm.get('sedefrm').value)
    console.log('sedes:',this.sedes)
    este.articulost = este.articulos; // <= Ojo aqui aseguro que la data del formulario este
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
      width: 700,
      height: 300
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
      this.articulos['serie'] = barcodeData.text;
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
  async updateIamgen() {
    let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizando...'
    });
    await loading.present();
    let child = 'inventario/'+this.sede.nombre+'/'+this.ubicacion.nombre+'/'+this.SubUbicacion.nombre+'/'+this.articulos.nombreImagen
    const imagenes = firebase.storage().ref(child);
    let imagen
    if(this.plataforma.android){
      imagen = [este.Path,'data_url'];
    }else{
      let src = este.Path.substr("data:image/jpeg;base64,/".length - 1);
      imagen = [src,'base64'];
    }
    imagenes.putString(imagen[0],imagen[1]).then(function(snapshot) {
      console.log('Uploaded a data_url string!');
      imagenes.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        console.log('ojo entro!');
        este.Path = url;
        // hago copia de respaldo por modificación
        este.updatekey = firebase.database().ref('modificaciones').push().key
        // ---- Actualizo la data local antes de escribirlo --------
        este.articulos.disponibilidad = este.newIngresoForm.value.disponibilidad;
        este.articulos.estado = este.newIngresoForm.value.estado;
        este.articulos.descripcion = este.newIngresoForm.value.descripcion;
        este.articulos.observaciones = este.newIngresoForm.value.observaciones;
        este.articulos.valor = este.newIngresoForm.value.valor;
        este.articulos.serie = este.newIngresoForm.value.serie;
        este.articulos.modificacion = new Date().toLocaleDateString();
        este.articulos.nombre = este.translate.articulos[este.articulos.articulo].nombre;
        // ---- Registro de modificaciones -------------
        firebase.database().ref('modificaciones')
        .child(este.articulos.key).child(este.updatekey).set(este.articulos)
        firebase.database().ref('modificaciones')
        .child(este.articulos.key).child(este.updatekey).child('modificaciones').push(este.updatekey)
        // ---- Actualizacion de los datos -------------
        firebase.database().ref('inventario2')
        .child(este.articulos.key).update(este.articulos);
        // ---- Actualiza la tabla de seriales ---------
        if(este.articulos.serie!=''){
          firebase.database().ref('seriales')
          .child(este.articulos.serie).set({
            articulokey: este.articulos.key,
            subUbicacionkey: este.articulos.subUbicacion
          })
        }
        // ---- Actualiza Etiqueta de ser necesario ----
        if(!este.articulos.etiquetaId){
          este.crearEtiqueta(este.articulos).then(()=>{
            loading.dismiss();
          })
        }else{
          loading.dismiss();
        }
      }).catch(function(error) {
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
    });
  }
  async update(){
    let este = this
    /* if(this.parametros.new){
      console.log('Se modificó la ubicacion del articulo!')
      this.Createarticulo()
      return
    } */
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    este.updatekey = firebase.database().ref('modificaciones').push().key
    // ---- Actualizo la data local antes de escribirlo --------
    este.articulos.disponibilidad = este.newIngresoForm.value.disponibilidad;
    este.articulos.estado = este.newIngresoForm.value.estado;
    este.articulos.descripcion = este.newIngresoForm.value.descripcion;
    este.articulos.observaciones = este.newIngresoForm.value.observaciones;
    este.articulos.valor = este.newIngresoForm.value.valor;
    este.articulos.serie = este.newIngresoForm.value.serie;
    este.articulos.modificacion = new Date().toLocaleDateString();
    este.articulos.nombre = este.translate.articulos[este.articulos.articulo].nombre;
    // ---- Registro de modificaciones -------------
    firebase.database().ref('modificaciones')
    .child(este.articulos.key).child(este.updatekey).set(este.articulos)
    firebase.database().ref('modificaciones')
    .child(este.articulos.key).child(este.updatekey).child('modificaciones').push(este.updatekey)
    // ---- Actualizacion de los datos -------------
    firebase.database().ref('inventario2')
    .child(este.articulos.key).update(este.articulos)
    .then(()=>{
      // ---- Verifica si hubo cambios de ubicación --
        console.log('Update: ',this.onchange)
        if(este.onchange.new.sede){
          console.log('cambio de sede')
          este.cambioSede(este.onchange);
        }else if(este.onchange.new.ubicaciones){
          console.log('cambio de ubicaciones')
          este.cambioUbicacion(este.onchange);
        }else if(este.onchange.new.subUbicacion){
          console.log('cambio de subUbicacion')
          este.cambioSubUbicacion(este.onchange);
        }
      // ---- Actualiza la tabla de seriales ---------
        if(este.articulos.serie!=''){
          firebase.database().ref('seriales')
          .child(este.articulos.serie).set({
            articulokey: este.articulos.key,
            subUbicacionkey: este.articulos.subUbicacion
          })
        }
      // ---- Actualiza Etiqueta de ser necesario ----
        if(!este.articulos.etiquetaId){
          este.crearEtiqueta(este.articulos).then(()=>{
            loading.dismiss();
            localStorage.removeItem("ingreso");
            este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
          })
        }else{
          loading.dismiss();
          localStorage.removeItem("ingreso");
          este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
        }
      // ---------------------------------------------
    })
  }
  cambioSede(data){
    // ---- Sumo la unidad en la nueva sede ------------------
      firebase.database().ref('sede').child(data.new.sede)
      .child('cantidad').once('value',cantSede=>{
        let cant1 = cantSede.val() + 1;
        firebase.database().ref('sede').child(data.new.sede)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja sede ----------------
        firebase.database().ref('sede').child(data.old.sede)
        .child('cantidad').once('value',cantSede=>{
          let cant0 = cantSede.val() - 1;
          firebase.database().ref('sede').child(data.old.sede)
          .child('cantidad').set(cant0)
        })
      })
    // ---- Sumo la unidad en la nueva Ubicacion -------------
      firebase.database().ref('ubicaciones2').child(data.new.ubicacion)
      .child('cantidad').once('value',cantubicaciones=>{
        let cant1 = cantubicaciones.val() + 1;
        firebase.database().ref('ubicaciones2').child(data.new.ubicacion)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja ubicaciones ----------------
        firebase.database().ref('ubicaciones2').child(data.old.ubicacion)
        .child('cantidad').once('value',cantubicaciones=>{
          let cant0 = cantubicaciones.val() - 1;
          firebase.database().ref('ubicaciones2').child(data.old.ubicacion)
          .child('cantidad').set(cant0)
        })
      })
    // ---- Sumo la unidad en la nueva subUbicacion ----------
      firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
      .child('cantidad').once('value',cantsubUbicacion=>{
        let cant1 = cantsubUbicacion.val() + 1;
        firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja subUbicacion ----------------
        firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
        .child('cantidad').once('value',cantsubUbicacion=>{
          let cant0 = cantsubUbicacion.val() - 1;
          firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
          .child('cantidad').set(cant0)
        })
      })
    // -------------------------------------------------------
  }
  cambioUbicacion(data){
    // ---- Sumo la unidad en la nueva Ubicacion -------------
      firebase.database().ref('ubicaciones2').child(data.new.ubicaciones)
      .child('cantidad').once('value',cantubicaciones=>{
        let cant1 = cantubicaciones.val() + 1;
        firebase.database().ref('ubicaciones2').child(data.new.ubicaciones)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja ubicaciones ----------------
        firebase.database().ref('ubicaciones2').child(data.old.ubicaciones)
        .child('cantidad').once('value',cantubicaciones=>{
          let cant0 = cantubicaciones.val() - 1;
          firebase.database().ref('ubicaciones2').child(data.old.ubicaciones)
          .child('cantidad').set(cant0)
        })
      })
    // ---- Sumo la unidad en la nueva subUbicacion ----------
      firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
      .child('cantidad').once('value',cantsubUbicacion=>{
        let cant1 = cantsubUbicacion.val() + 1;
        firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja subUbicacion ----------------
        firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
        .child('cantidad').once('value',cantsubUbicacion=>{
          let cant0 = cantsubUbicacion.val() - 1;
          firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
          .child('cantidad').set(cant0)
        })
      })
    // -------------------------------------------------------
  }
  cambioSubUbicacion(data){
    // ---- Sumo la unidad en la nueva subUbicacion ----------
      firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
      .child('cantidad').once('value',cantsubUbicacion=>{
        let cant1 = cantsubUbicacion.val() + 1;
        firebase.database().ref('subUbicaciones2').child(data.new.subUbicacion)
        .child('cantidad').set(cant1)
      }).then(old =>{
        // ---- Resto la unidad en la vieja subUbicacion ----------------
        firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
        .child('cantidad').once('value',cantsubUbicacion=>{
          let cant0 = cantsubUbicacion.val() - 1;
          firebase.database().ref('subUbicaciones2').child(data.old.subUbicacion)
          .child('cantidad').set(cant0)
        })
      })
    // -------------------------------------------------------
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
  async Createarticulo(){
    let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizado a: '+this.SubUbicacion.nombre
    });
    await loading.present();
    este.updatekey = firebase.database().ref('modificaciones').push().key
    firebase.database().ref('modificaciones').child(este.articulo.key).child(este.updatekey).set({
      imagen: este.Path,
      modificacionkey: este.updatekey,
      modificacion: new Date().toLocaleDateString(),
      creacion: new Date(este.timestamp).toLocaleDateString(),
      nombre: este.articulo.nombre,
      articulo: este.articulo,
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
    })
    let data = {
      imagen: este.Path,
      modificacionkey: este.updatekey,
      modificacion: new Date().toLocaleDateString(),
      creacion: new Date(este.timestamp).toLocaleDateString(),
      nombreImagen: este.articulos.nombreImagen,
      nombre: este.articulo.nombre,
      articulo: este.articulo,
      cantidad: 1,
      disponibilidad: este.newIngresoForm.value.disponibilidad,
      estado: este.newIngresoForm.value.estado,
      descripcion: este.newIngresoForm.value.descripcion,
      observaciones: este.newIngresoForm.value.observaciones,
      valor: este.newIngresoForm.value.valor,
      serie: este.newIngresoForm.value.serie,
      sede: este.sede,
      ubicacion: este.ubicacion,
      subUbicacion: este.SubUbicacion
    }
    for(let index in data){
      if(typeof data[index] === "undefined"){
        data[index] = ''
      }
    }
    console.log('ojo entro!',data);
    firebase.database().ref(este.parametros['new'].ArticuloChild).set(data).then(()=>{
      este.remueveArticulo(este.parametros['old'].articulo).then(()=>{
        let data = {
          imagen: este.Path,
          nombreImagen: este.articulos.nombreImagen,
          nombre: este.articulo.nombre,
          articulo: este.articulo,
          cantidad: 1,
          disponibilidad: este.newIngresoForm.value.disponibilidad,
          estado: este.newIngresoForm.value.estado,
          descripcion: este.newIngresoForm.value.descripcion,
          observaciones: este.newIngresoForm.value.observaciones,
          valor: este.newIngresoForm.value.valor,
          serie: este.newIngresoForm.value.serie,
          sede: este.sede,
          key: este.articulos.key,
          ubicacion: este.ubicacion,
          subUbicacion: este.SubUbicacion
        }
        console.log('Data',data)
        for(let index in data){
          if(typeof data[index] === "undefined"){
            data[index] = ''
          }
        }
        este.crearEtiqueta(data).then(async ()=>{
          const alert = await este.alertController.create({
            header: 'Articulo actualizado',
            subHeader: 'Confirmación de cambio de locacion',
            message: 'El articulo fue cambiado de locación correctamente y su nueva etiqueta fue creada',
            buttons: ['OK']
          });
          loading.dismiss();
          await alert.present();
        })
      })
      // firebase.database().ref(este.parametros['old'].ArticuloChild).remove().then(r=>{
      //   loading.dismiss()
      //   este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
      // })
    })
  }
  async RemoveArticulo(articulo){
    let este = this
    const alert = await this.alertController.create({
      header: 'Cuidado!',
      message: 'Se <strong>eliminará</strong> la articulo '+este.translate.articulos[este.articulos.articulo].nombre+' !!!',
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
    return firebase.database().ref('inventario2').child(este.articulos.key).remove()
    .then(()=>{
      // ---- Leo la cantidad en la subUbicacion -----------------------------------
      firebase.database().ref('subUbicaciones2').child(este.articulos.subUbicacion)
      .child('cantidad').once('value',sub=>{
        let subnc = sub.val() - 1;
        // ---- Escribo la nueva cantidad en la subUbicacion -----------------------
        firebase.database().ref('subUbicaciones2').child(este.articulos.subUbicacion)
        .child('cantidad').set(subnc)
      }).then(()=>{
        // ---- Leo la cantidad en la Ubicacion -----------------------------------
        firebase.database().ref('ubicaciones2').child(este.articulos.ubicacion)
        .child('cantidad').once('value',u=>{
          let unc = u.val() - 1;
          // ---- Escribo la nueva cantidad en la Ubicacion -----------------------
          firebase.database().ref('ubicaciones2').child(este.articulos.ubicacion)
          .child('cantidad').set(unc)
        }).then(()=>{
          // ---- Leo la cantidad en la sede -----------------------------------
          firebase.database().ref('sedes').child(este.articulos.sede)
          .child('cantidad').once('value',s=>{
            let snc = s.val() - 1;
            // ---- Escribo la nueva cantidad en la sede -----------------------
            firebase.database().ref('sedes').child(este.articulos.sede)
            .child('cantidad').set(snc)
            // ---- Borro la etiqueta del articulo -----------------------------
            este.deleteFCloud(este.articulos.etiquetaId).then(async ()=>{
              localStorage.removeItem("ingreso");
              console.log('Articulo y Etiqueta de articulo eliminados')
              localStorage.removeItem("ingreso");
            })
          })
        })
      })
    })
  }
  async crearEtiqueta(articulo){
    let este = this
    console.log('Entro a crear etiqueta',articulo)
    let createLabels = firebase.functions().httpsCallable("createLabels");
    articulo['fecha'] = new Date().toLocaleDateString();
    let qrData = {
      "subUbicacion": articulo.subUbicacion,
      "ingreso": articulo.key
    }
    let query = "";
    for (let key in qrData) {
        query += encodeURIComponent(key)+"="+encodeURIComponent(qrData[key])+"&";
    }
    let uri = 'https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl='+encodeURIComponent(query)//escape(JSON.stringify(qrData))
    articulo['qrUrl'] = encodeURI(uri)
    // console.log('data para crear el acta:',data)
    await createLabels(articulo).then(async function(response) {
      // Read result of the Cloud Function.
      este.etiqueta=[]
      // console.log(conta,i,data,'Funcion Etiqueta respondio ok: ',response);
      este.etiqueta['url'] = 'https://docs.google.com/presentation/d/'+response.data.etiqueta.id+'/edit'//'/export/pdf'//'https://docs.google.com/document/d/'+response.data.doc.id+'/edit'
      await firebase.database().ref('inventario2')
      .child(articulo.key)
      .update({
        etiqueta: este.etiqueta['url'],
        etiquetaId: response.data.etiqueta.id,
        fechaEtiqueta: new Date().toLocaleDateString()
      }).then(re=>{
        let message = 'La etiqueta fue creada'
        console.log(message,articulo)
        // este.presentToastWithOptions(message,3000,'top')
      })
    }).catch(function(error) {
      // Read result of the Cloud Function.
      console.log('Error en crear Etiqueta: ',error);
      // let message = 'Error en crear Etiqueta: '+error
      // este.presentToastWithOptions(message,3000,'top')
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