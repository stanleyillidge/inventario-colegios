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
  sedeObj:any={};
  ubicacion:any={};
  SubUbicacion:any={};
  //-------------------
  esquemaDB:any={};
  sedes:any=[];
  ubicaciones:any;
  SubUbicaciones:any;
  NewChild:any;
  OldChild:any;
  //-------------------
  articulo:any={};
  titulo;
  scanData;
  Path:any="/assets/shapes.svg";
  base64Image;
  numArt:any=0;
  plataforma:any=[];
  imagen: File = null;
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
    this.articulo['nombre'] = this.route.snapshot.paramMap.get('articuloNombre')
    this.articulo['key'] = this.route.snapshot.paramMap.get('articulokey')
    this.SubUbicacion['nombre'] = this.route.snapshot.paramMap.get('SubUbicacionNombre')
    this.SubUbicacion['key'] = this.route.snapshot.paramMap.get('SubUbicacionkey')
    this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
    this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
    this.sedeObj['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sedeObj['key'] = this.route.snapshot.paramMap.get('sedekey')
    este.titulo = este.sedeObj.nombre +' / '+ este.ubicacion['nombre'] +' / '+ este.SubUbicacion.nombre
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
      este.esquemaDB['sede'] = este.esquemaDB['sedes'][este.sedeObj['nombre']]
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
    firebase.database().ref('inventario/'+this.SubUbicacion.key+'/'+this.articulo.key).once('value', function(articulo) {
      console.log(articulo.val())
      este.articulos = articulo.val();
      este.Path = articulo.val().imagen;
      este.articulost = este.articulos;
      // --- Creo el formulario ----
      let val = este.articulos.sede.nombre
      // (val === undefined || val == null || val.length <= 0)
      if(este.articulos.sede.nombre){
        console.log('entre')
        let a = este.articulos.sede
        este.articulos.sede = {}
        este.articulos.sede['nombre'] = este.sedeObj.nombre
        este.articulos.sede['key'] = este.sedeObj.key
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
      }
      este.creaFormulario(este.articulos)
      // ---------------------------
    });
  }
  async onSedeChange(s){
    let este = this
    console.log(s.target.value,this.esquemaDB)
    este.esquemaDB['sede'] = {}
    este.esquemaDB['sede'] = este.esquemaDB['sedes'][s.target.value]//this.newIngresoForm.get('sedefrm').value;
    this.ubicaciones = null;
    this.SubUbicaciones = null;
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
    this.NewChild = 'inventario/'+subUbicacion.key+'/'+this.articulo.key;
    this.OldChild = 'inventario/'+this.SubUbicacion.key+'/'+this.articulo.key;
    console.log('OldChild',this.OldChild)
    console.log('NewChild',this.NewChild)
    // --- Remueve el child anterior ----
    // firebase.database().ref(NewChild).push(este.articulos)
    // .then(remov=>{
    //   console.log('Fue movido')
    //   firebase.database().ref(OldChild).remove().then(r=>{
    //     console.log('Fue removido')
    //   })
    // })
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
    console.log('sede: ',this.newIngresoForm.get('sedefrm').value)
    console.log('sedes: ',this.sedes)
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
            firebase.database().ref('articulos/'+this.ubicacion+'/'+este.articulosKeys[index]+'/nombre').set(d.articulo)
            // this.articulos[index]=d.articulo
            console.log('Edit Ok',this.articulos);
          }
        }
      ]
    });

    await alert.present();
  }
  async updateIamgen() {
    let este = this
    const loading = await this.loadingController.create({
      message: 'Actualizado...'
    });
    await loading.present();
    let child = 'inventario/'+this.sedeObj.nombre+'/'+this.ubicacion.nombre+'/'+this.SubUbicacion.nombre+'/'+this.articulos.nombreImagen
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
        firebase.database().ref('inventario/'+este.SubUbicacion.key+'/'+este.articulo.key).update({
          imagen: url,
          nombre: este.articulo.nombre,
          cantidad: 1,
          disponibilidad: este.newIngresoForm.value.disponibilidad,
          estado: este.newIngresoForm.value.estado,
          descripcion: este.newIngresoForm.value.descripcion,
          observaciones: este.newIngresoForm.value.observaciones,
          valor: este.newIngresoForm.value.valor,
          serie: este.newIngresoForm.value.serie,
          sede: este.sedeObj,
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
      sede: este.sedeObj,
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
        sede: este.sedeObj
      }]);
    })
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