import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform } from '@ionic/angular';
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
  sede;
  ubicacion:any={};
  SubUbicacion:any={};
  articulo:any={};
  titulo;
  scanData;
  Path:any="/assets/shapes.svg";
  base64Image;
  constructor(
    public plataforma: Platform,
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
    public loadingController: LoadingController
  ) {
    let este = this
    let data ={};
    this.articulo['nombre'] = this.route.snapshot.paramMap.get('articuloNombre')
    this.articulo['key'] = this.route.snapshot.paramMap.get('articulokey')
    this.SubUbicacion['nombre'] = this.route.snapshot.paramMap.get('SubUbicacionNombre')
    this.SubUbicacion['key'] = this.route.snapshot.paramMap.get('SubUbicacionkey')
    this.ubicacion['nombre'] = this.route.snapshot.paramMap.get('ubicacionNombre')
    this.ubicacion['key'] = this.route.snapshot.paramMap.get('ubicacionkey')
    this.sede = this.route.snapshot.paramMap.get('sede')
    this.titulo = this.sede +' / '+ this.ubicacion['nombre'] +' / '+ this.SubUbicacion.nombre
    data['articulo'] = this.articulo;
    data['SubUbicacion'] = this.SubUbicacion;
    data['ubicacion'] = this.ubicacion;
    // --- Creo el formulario ----
    this.creaFormulario(data)
    // ---------------------------
  }
  creaFormulario(data){
    //-------------------
      this.newIngresoForm = this.fb.group({
        valor: new FormControl(0, Validators.compose([
          // Validators.required,
          Validators.maxLength(7),
          Validators.minLength(1),
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        nombre: new FormControl(data.articulo.nombre, Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        serie: new FormControl('', Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        estado: new FormControl('Bueno', Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        disponibilidad: new FormControl('Si', Validators.compose([
          Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        observaciones: new FormControl('', Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        descripcion: new FormControl('', Validators.compose([
          // Validators.required,
          // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])),
        cantidad: new FormControl(1, Validators.compose([
          Validators.required,
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
  escaner(){
    this.barcodeScanner.scan().then(barcodeData => {
      this.scanData = barcodeData;
      console.log('Barcode data', barcodeData);
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
    const loading = await this.loadingController.create({
      message: 'Ingreso en '+this.SubUbicacion.nombre
    });
    await loading.present();
    let child = 'inventario/'+this.sede+'/'+this.ubicacion.nombre+'/'+this.SubUbicacion.nombre+'/'+this.articulo.nombre+' - '+new Date().getTime()+'.jpeg'
    const imagenes = firebase.storage().ref(child);
    imagenes.putString(este.Path,'data_url').then(function(snapshot) {
      console.log('Uploaded a data_url string!');
      imagenes.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        console.log('ojo entro!');
        este.Path = url;
        firebase.database().ref('inventario/'+este.SubUbicacion.key).push({
          imagen: url,
          nombre: este.articulo.nombre,
          cantidad: 1,
          disponibilidad: este.newIngresoForm.value.disponibilidad,
          estado: este.newIngresoForm.value.estado,
          descripcion: este.newIngresoForm.value.descripcion,
          observaciones: este.newIngresoForm.value.observaciones,
          valor: este.newIngresoForm.value.valor,
          sede: este.sede,
          ubicacion: este.ubicacion,
          subUbicacion: este.SubUbicacion,
        }).then(()=>{
          loading.dismiss()
          este.navCtrl.navigateBack(['inventario-sububicacion']);
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
  ngOnInit() {
  }

}