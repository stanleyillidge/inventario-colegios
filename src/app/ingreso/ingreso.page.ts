import { Component, OnInit } from '@angular/core';
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
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
})
export class IngresoPage implements OnInit {
  newIngresoForm: FormGroup;
  articulos:any=[]
  articulost:any
  articulosKeys:any=[]
  sede:any={};
  ubicacion:any={};
  SubUbicacion:any={};
  articulo:any={};
  titulo;
  scanData:any = 'xx';
  Path:any = "/assets/shapes.svg";
  base64Image;
  numArt:any=0;
  plataforma:any=[];
  cantidad: any;
  imagen: File;
  validarImagen:any=false;
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
    public toastController: ToastController
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
    this.sede['nombre'] = this.route.snapshot.paramMap.get('sedeNombre')
    this.sede['key'] = this.route.snapshot.paramMap.get('sedekey')
    this.titulo = this.sede +' / '+ this.ubicacion['nombre'] +' / '+ this.SubUbicacion.nombre
    // --- Creo el formulario ----
    let data ={
      valor:0,
      nombre:this.articulo.nombre,
      serie:'',
      estado:'Bueno',
      disponibilidad:'Si',
      observaciones:'',
      descripcion:'',
      cantidad:''
    };
    this.creaFormulario(data)
    firebase.database().ref('subUbicaciones').child(this.ubicacion.key).child(this.SubUbicacion.key).once('value', function(subUbicacionSN) {
      este.cantidad = subUbicacionSN.val().cantidad;
    })
    // ---------------------------
  }
  creaFormulario(data){
    //-------------------
      this.newIngresoForm = this.fb.group({
        valor: new FormControl(data.valor, Validators.compose([
          // Validators.required,
          // Validators.maxLength(7),
          // Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        nombre: new FormControl(data.nombre, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        serie: new FormControl(data.serie, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        estado: new FormControl(data.estado, Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        disponibilidad: new FormControl(data.disponibilidad, Validators.compose([
          // Validators.required,
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
          Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ]))
      });
    //-------------------
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
                this.validarImagen = true;
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
      este.validarImagen = true;
      // console.log(este.Path);
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
  async Createarticulo() {
    let este = this
    if(this.validarImagen){
      const loading = await this.loadingController.create({
        message: 'Ingreso en '+this.SubUbicacion.nombre
      });
      await loading.present();
      firebase.database().ref('inventario').once('value', function(articulos) {
        articulos.forEach(articulo => {
          // console.log(articulo.val())
         este.numArt += articulo.numChildren() + 1;
        });
      });
      let nombreImagen = this.articulo.nombre+' - '+este.numArt+'.jpeg';
      let child = 'inventario/'+this.sede.nombre+'/'+this.ubicacion.nombre+'/'+this.SubUbicacion.nombre+'/'+nombreImagen
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
          firebase.database().ref('inventario/'+este.SubUbicacion.key).push(data).then(()=>{
            este.cantidad += 1;
            firebase.database().ref('subUbicaciones').child(este.ubicacion.key).child(este.SubUbicacion.key).child('cantidad').set( este.cantidad )
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
    }else{
      this.presentToastWithOptions('Debes cargar una imagen',3000,'top')
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