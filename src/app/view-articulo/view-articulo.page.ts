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
  Path:any="/assets/shapes.svg";
  base64Image;
  numArt:any=0;
  plataforma:any=[];
  imagen: File = null;
  NewArticulo: any = {};
  ArticuloChild: string;
  NewArticuloChild: string;
  updatekey: string;
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
    console.log(este.parametros['old'])
    este.titulo = este.sede.nombre +' / '+ este.ubicacion['nombre'] +' / '+ este.SubUbicacion.nombre
    //-----------------------------------------------------
    firebase.database().ref('sedes').once('value',async (sedesSnap)=>{
      este.esquemaDB['sedes'] = sedesSnap.val();
      await sedesSnap.forEach(sede=>{
        let a = {}
        a = sede.val()
        a['key'] = sede.key
        este.esquemaDB['sedes'][sede.val().nombre]={}
        este.esquemaDB['sedes'][sede.val().nombre]['key'] = sede.key
        este.esquemaDB['sedes'][sede.val().nombre]['cantidad'] = sede.val().cantidad
        este.sedes.push(a)
      });
      este.ubicaciones = [];
      este.esquemaDB['sede'] = {}
      este.esquemaDB['sede'] = este.esquemaDB['sedes'][este.sede['nombre']]
      await firebase.database().ref('ubicaciones').child(este.esquemaDB['sede'].key).once('value',async (sedesuSnap)=>{
        // console.log(este.esquemaDB['sedes'][este.esquemaDB['sede'].key].nombre)
        este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'] = {};
        este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'] = sedesuSnap.val();
        await sedesuSnap.forEach( sedeu =>{
          let a = {}
          a = sedeu.val()
          a['key'] = sedeu.key
          este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]={}
          este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]['key'] = sedeu.key
          este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]['cantidad'] = sedeu.val().cantidad
          este.ubicaciones.push(a)
        });
        let sede = este.esquemaDB['sede'];
        let ubicacion = este.esquemaDB['sedes'][sede.key]['ubicaciones'][este.ubicacion['nombre']];
        este.esquemaDB['ubicacion'] = ubicacion;
        firebase.database().ref('subUbicaciones').child(ubicacion.key).once('value',async (SubUbicacionesSnap)=>{
          este.SubUbicaciones = [];
          // console.log(este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key].nombre)
          este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'] = {}
          este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'] = SubUbicacionesSnap.val();
          await SubUbicacionesSnap.forEach( SubUbicacion =>{
            let a = {}
            a = SubUbicacion.val()
            a['key'] = SubUbicacion.key
            este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]={}
            este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]['key'] = SubUbicacion.key
            este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]['cantidad'] = SubUbicacion.val().cantidad
            este.SubUbicaciones.push(a)
          })
        })
      })
    });
    console.log(este.esquemaDB)
    // ----------------------------------------------------
    console.log(this.articulo)
    firebase.database().ref('inventario/'+this.SubUbicacion.key+'/'+this.articulo.key).once('value', function(articulo) {
      console.log(articulo.val())
      este.articulos = articulo.val();
      este.Path = articulo.val().imagen;
      // --- Creo el formulario ----
      if(este.NewArticulo['nombre']){
        console.log('entro cambia nombre', este.NewArticulo['nombre'])
        este.articulos.nombre = este.NewArticulo['nombre'];
        este.articulo.nombre = este.NewArticulo['nombre'];
        // este.articulo.key = este.NewArticulo['key'];
      }
      /* if(este.articulos.sede.nombre){
        console.log('entro cambia sede', este.articulos.sede.nombre)
        let a = este.articulos.sede
        este.articulos.sede = {}
        este.articulos.sede['nombre'] = este.sede.nombre
        este.articulos.sede['key'] = este.sede.key
        este.articulos.sede['cantidad'] = 0

        a = este.articulos.ubicacion
        este.articulos.ubicacion = {}
        este.articulos.ubicacion['nombre'] = este.ubicacion.nombre
        este.articulos.ubicacion['key'] = este.ubicacion.key
        este.articulos.ubicacion['cantidad'] = 0

        a = este.articulos.subUbicacion
        este.articulos.subUbicacion = {}
        este.articulos.subUbicacion['nombre'] = este.SubUbicacion.nombre
        este.articulos.subUbicacion['key'] = este.SubUbicacion.key
        este.articulos.subUbicacion['cantidad'] = 0
      } */
      este.creaFormulario(este.articulos)
      // ---------------------------
    });
  }
  modificaNombre(){
    console.log(this.sede,this.ubicacion,this.SubUbicacion)
    this.navCtrl.navigateForward(['edita-path',{ 
      articuloNombre: this.articulo.nombre,
      articulokey: this.articulo.key,
      SubUbicacionNombre: this.SubUbicacion.nombre,
      SubUbicacionkey: this.SubUbicacion.key,
      ubicacionNombre: this.ubicacion.nombre,
      ubicacionkey: this.ubicacion.key,
      sedeNombre: this.sede.nombre,
      sedekey: this.sede.key
    }]);
  }
  async onSedeChange(s){
    let este = this
    console.log(s.target.value,this.esquemaDB)
    este.esquemaDB['sede'] = {}
    este.esquemaDB['sede'] = este.esquemaDB['sedes'][s.target.value]//this.newIngresoForm.get('sedefrm').value;
    this.sede = este.esquemaDB['sede'];
    this.sede['nombre'] = s.target.value
    this.ubicaciones = null;
    this.newIngresoForm.get('ubicacionfrm').setValue(null);
    this.SubUbicaciones = null;
    this.newIngresoForm.get('subUbicacionfrm').setValue(null);
    await firebase.database().ref('ubicaciones').child(este.esquemaDB['sede'].key).once('value',async (sedesuSnap)=>{
      este.ubicaciones = [];
      // console.log(este.esquemaDB['sedes'][este.esquemaDB['sede'].key].nombre)
      este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'] = {};
      este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'] = sedesuSnap.val();
      await sedesuSnap.forEach( sedeu =>{
        let a = {}
        a = sedeu.val()
        a['key'] = sedeu.key
        este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]={}
        este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]['key'] = sedeu.key
        este.esquemaDB['sedes'][este.esquemaDB['sede'].key]['ubicaciones'][sedeu.val().nombre]['cantidad'] = sedeu.val().cantidad
        este.ubicaciones.push(a)
      })
    })
    console.log(este.esquemaDB,this.ubicaciones)
    this._cdr.detectChanges();
  }
  onUbicacionChange(u){
    let este = this
    this.SubUbicaciones = null;
    este.esquemaDB['ubicacion'] = {}
    let sede = este.esquemaDB['sede'];//this.newIngresoForm.get('sedefrm').value;
    let ubicacion = este.esquemaDB['sedes'][sede.key]['ubicaciones'][u.target.value];//this.newIngresoForm.get('ubicacionfrm').value;
    este.esquemaDB['ubicacion'] = ubicacion;
    this.ubicacion = ubicacion;
    this.ubicacion['nombre'] = u.target.value;
    firebase.database().ref('subUbicaciones').child(ubicacion.key).once('value',async (SubUbicacionesSnap)=>{
      this.SubUbicaciones = [];
      // console.log(este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key].nombre)
      este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'] = {}
      este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'] = SubUbicacionesSnap.val();
      await SubUbicacionesSnap.forEach( SubUbicacion =>{
        let a = {}
        a = SubUbicacion.val()
        a['key'] = SubUbicacion.key
        este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]={}
        este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]['key'] = SubUbicacion.key
        este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][SubUbicacion.val().nombre]['cantidad'] = SubUbicacion.val().cantidad
        este.SubUbicaciones.push(a)
      })
    })
    // console.log(sede,ubicacion,this.SubUbicaciones)
    this._cdr.detectChanges();
  }
  onSubUbicacionChange(sub){
    let este = this
    let sede = este.esquemaDB['sede'];
    let ubicacion = este.esquemaDB['ubicacion'];
    let subUbicacion = este.esquemaDB['sedes'][sede.key]['ubicaciones'][ubicacion.key]['SubUbicaciones'][sub.target.value];
    this.SubUbicacion = subUbicacion;
    this.SubUbicacion['nombre'] = sub.target.value;
    this.NewArticuloChild = 'inventario/'+subUbicacion.key+'/'+this.articulo.key;
    this.parametros['new'] = {
      ArticuloChild: this.NewArticuloChild,
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
    console.log('OldChild',this.ArticuloChild)
    console.log('NewChild',this.NewArticuloChild)
  }
  creaFormulario(data){
    let este = this
    //-------------------
      console.log('data:',data)
      this.newIngresoForm = this.fb.group({
        sedefrm: new FormControl(data.sede.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        ubicacionfrm: new FormControl(data.ubicacion.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        subUbicacionfrm: new FormControl(data.subUbicacion.nombre, Validators.compose([
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
    //-------------------
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
      quality: 50,
      width: 350,
      height: 150
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
        firebase.database().ref('modificaciones').child(este.articulo.key).child(este.updatekey).set({
          imagen: url,
          modificacion: new Date().toLocaleDateString(),
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
        firebase.database().ref(este.parametros['old'].ArticuloChild).update({
          imagen: url,
          modificacion: este.updatekey,
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
        }).then(()=>{
          loading.dismiss()
          este.presentToastWithOptions('Imagen actualizada',3000,'top')
        })
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
    if(this.parametros.new){
      console.log('Se modificó la ubicacion del articulo!')
      this.Createarticulo()
    }
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    este.updatekey = firebase.database().ref('modificaciones').push().key
    firebase.database().ref('modificaciones').child(este.articulo.key).child(este.updatekey).set({
      imagen: este.Path,
      modificacion: new Date().toLocaleDateString(),
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
    firebase.database().ref(este.parametros['old'].ArticuloChild).update({
      nombre: este.articulo.nombre,
      modificacion: este.updatekey,
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
    }).then(()=>{
      // if(child == este.NewArticuloChild){
      //   console.log('Fue movido')
      //   firebase.database().ref(este.ArticuloChild).remove().then(r=>{
      //     console.log('Fue removido')
      //   })
      // }
      loading.dismiss()
      este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
    })
  }
  async Createarticulo(){
    let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizado a: '+this.SubUbicacion.nombre
    });
    await loading.present();
    let data = {
      imagen: este.Path,
      nombreImagen: este.articulos.nombreImagen,
      nombre: este.articulos.nombre,
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
      if(data[index] == "undefined"){
        data[index] = ''
      }
    }
    console.log('ojo entro!',data);
    firebase.database().ref(este.parametros['new'].ArticuloChild).set(data).then(()=>{
      firebase.database().ref(este.parametros['old'].ArticuloChild).remove().then(r=>{
        loading.dismiss()
        este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
      })
    })
  }
  /* async Createarticulo2() {
    let este = this
    const loading = await this.loadingController.create({
      message: 'Ingreso en '+this.SubUbicacion.nombre
    });
    await loading.present();
    firebase.database().ref('subUbicaciones').child(this.ubicacion.key).child(this.SubUbicacion.key).once('value', function(subUbicacionSN) {
      // este.cantidad = subUbicacionSN.val().cantidad;
      // este.numArt = subUbicacionSN.val().cantidad +1;
      let nombreImagen = este.articulo.nombreImagen;
      let child = 'inventario/'+este.sede.nombre+'/'+este.ubicacion.nombre+'/'+este.SubUbicacion.nombre+'/'+nombreImagen
      const imagenes = firebase.storage().ref(child);
      let imagen
      imagen = [este.Path,'data_url'];
      // if(este.plataforma.android){
      //   imagen = [este.Path,'data_url'];
      // }else{
      //   let src = este.Path.substr("data:image/jpeg;base64,/".length - 1);
      //   imagen = [src,'base64'];
      // }
      imagenes.putString(imagen[0],imagen[1]).then(function(snapshot) {
        console.log('Uploaded a data_url string!');
        imagenes.getDownloadURL().then(function(url) {
          // Insert url into an <img> tag to "download"
          let data = {
            imagen: url,
            nombreImagen: nombreImagen,
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
            subUbicacion: este.SubUbicacion
          }
          for(let index in data){
            if(data[index] == "undefined"){
              data[index] = ''
            }
          }
          console.log('ojo entro!',data);
          este.Path = url;
          firebase.database().ref(este.parametros['new'].ArticuloChild).set(data).then(()=>{
            // este.cantidad += 1;
            // firebase.database().ref('subUbicaciones').child(este.ubicacion.key).child(este.SubUbicacion.key).child('cantidad').set( este.cantidad )
            firebase.database().ref(este.parametros['old'].ArticuloChild).remove().then(r=>{
              loading.dismiss()
              este.navCtrl.navigateBack(['inventario-sububicacion',este.parametros['old']]);
            })
          })
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
    })
  } */
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