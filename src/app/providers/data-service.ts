import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import { Router } from "@angular/router";
import { LoadingController, AlertController, Platform, ToastController } from '@ionic/angular';
// Ionic Storage
import { Storage } from '@ionic/storage';
import { ReplaySubject } from 'rxjs';
import { Sede, Ubicacion, SubUbicacion, LocalDatabase, Articulo, ArticuloBase, Sheet } from '../models/user-model';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Injectable()
export class DataService {
    public SedesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public UbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public SubUbicacionesObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public ArticuloBaseObserver: ReplaySubject<any> = new ReplaySubject<any>();
    public ArticulosObserver: ReplaySubject<any> = new ReplaySubject<any>();
    database: LocalDatabase;
    plataforma: any = {desktop:Boolean,android:Boolean};
    looper:number = 0;
    constructor(
        public platform: Platform,
        public alertController: AlertController,
        public toastController: ToastController,
        public router: Router,
        public loadingController: LoadingController,
        public ngZone: NgZone, // NgZone service to remove outside scope warning
        private webview: WebView,
        private fileTransfer: FileTransfer,
        private file: File,
        private storage: Storage
    ) {
        let este = this;
        this.plataforma.desktop = this.platform.is("desktop");
        this.plataforma.android = this.platform.is("android");
        this.plataforma.cordova = this.platform.is("cordova");
        // this.storage.clear();// quitar cuando este en produccion
    }
    // ---- Database -----------------------------
        async initDatabase(){
            let este = this
            if(this.plataforma.cordova){
                this.checkDir()
            }
            await this.storage.get('database').then(async (val) => {
                if(val){
                    let datax = val;
                    if(!this.IsJsonString(val)){
                        datax = JSON.stringify(val);
                    }
                    await this.cargaModelos(JSON.parse(datax)).then((r)=>{
                        console.log(r)
                        este.database = r
                        console.log('Si hay data',este.database);
                        este.sedes()
                        return true
                    })
                }else{
                    console.log('No hay datos almacenados');
                    este.decargaDatabase()
                    return false
                }
            });
        }
        async decargaDatabase(){
            let este = this;
            const loading = await this.loadingController.create({
                spinner:"dots",//"lines",//"circles",//"bubbles",
                translucent: true,
                cssClass: 'backRed'
            });
            await loading.present();
            this.database = new LocalDatabase;
            firebase.database().ref('articulos').once('value', function(articulosx){
                este.database.ArticulosBase = {}
                articulosx.forEach(articulox=>{
                    const modelo = new ArticuloBase();// = articulox.val();
                    // console.log('Sede:',sede.key,data)
                    este.database.ArticulosBase[articulox.key] = modelo//articulosx.val().nombre
                    este.database.ArticulosBase[articulox.key]['key'] = articulox.key;
                    este.database.ArticulosBase[articulox.key]['nombre'] = articulox.val().nombre;
                    este.database.ArticulosBase[articulox.key]['tipo'] = articulox.val().tipo;
                })
            }).then(()=>{
                firebase.database().ref('inventario2').once('value', function(articulos){
                    este.database.Articulos = {}
                    articulos.forEach(function(articulo){
                        const modelo = new Articulo();// = articulo.val();
                        // console.log('Sede:',sede.key,data)
                        este.database.Articulos[articulo.key] = este.iteraModelo(modelo, articulo.val());
                        este.database.Articulos[articulo.key]['key'] = articulo.key;
                        este.looper = 0;
                        este.download(este.database.Articulos[articulo.key]).then(r=>{
                            // console.log(r)
                            este.database.Articulos[articulo.key].imagen = r
                        })
                    })
                }).then(()=>{
                    firebase.database().ref('ubicaciones2').once('value',(ubicaciones)=>{
                        este.database.Ubicaciones = {};
                        ubicaciones.forEach(ubicacion=>{
                            const modelo = new Ubicacion();// = ubicacion.val();
                            // console.log('Sede:',ubicacion.key,data)
                            este.database.Ubicaciones[ubicacion.key] = este.iteraModelo(modelo, ubicacion.val());
                            este.database.Ubicaciones[ubicacion.key]['key'] = ubicacion.key;
                            este.looper = 0;
                            este.download(este.database.Ubicaciones[ubicacion.key]).then(r=>{
                                // console.log(r)
                                este.database.Ubicaciones[ubicacion.key].imagen = r
                            })
                        })
                    }).then(()=>{
                        firebase.database().ref('subUbicaciones2').once('value',(subUbicaciones)=>{
                            este.database.SubUbicaciones = {}
                            subUbicaciones.forEach(subUbicacion=>{
                                const modelo = new SubUbicacion();// = subUbicacion.val();
                                // console.log('Sede:',subUbicacion.key,data)
                                este.database.SubUbicaciones[subUbicacion.key] = este.iteraModelo(modelo, subUbicacion.val());
                                este.database.SubUbicaciones[subUbicacion.key]['key'] = subUbicacion.key;
                                este.looper = 0;
                                este.download(este.database.SubUbicaciones[subUbicacion.key]).then(r=>{
                                    // console.log(r)
                                    este.database.SubUbicaciones[subUbicacion.key].imagen = r
                                })
                            })
                        }).then(()=>{
                            firebase.database().ref('sedes').once('value', function(sedes){
                                este.database.Sedes = {}
                                sedes.forEach(sede=>{
                                    // const data: Sede = sede.val();
                                    const modelo = new Sede();
                                    // console.log('Sede:',sede.key,data)
                                    este.database.Sedes[sede.key] = este.iteraModelo(modelo, sede.val());
                                    este.database.Sedes[sede.key]['key'] = sede.key;
                                    este.looper = 0;
                                    este.download(este.database.Sedes[sede.key]).then(r=>{
                                        // console.log(r)
                                        este.database.Sedes[sede.key].imagen = r
                                    })
                                })
                            }).then(()=>{
                                este.database.Actualizar = false;
                                este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                                    console.log('Database:',este.database)
                                    // console.log('Sedes:',este.database.total(este.database.Sedes),este.database.cantidad(este.database.Sedes))
                                    // console.log('SubUbicaciones:',este.database.total(este.database.SubUbicaciones),este.database.cantidad(este.database.SubUbicaciones))
                                    // console.log('Ubicaciones:',este.database.total(este.database.Ubicaciones),este.database.cantidad(este.database.Ubicaciones))
                                    este.SedesObserver.next(este.database);
                                    loading.dismiss();
                                })
                            })
                        });
                    }); 
                }); 
            });
        }
        get Database(){
            return this.database
        }
        iteraModelo(modelo: any, data: any) {
            Object.keys(modelo).forEach(i => {
                if (typeof data[i] !== 'undefined') {
                    modelo[i] = data[i];
                }
            });
            return modelo
        }
        async cargaModelos(data){
            let este = this
            este.database = new LocalDatabase
            // console.log('Your data is', este.database);
            este.database.Sedes = {}
            Object.keys(data.Sedes).forEach(key=>{
              const modelo = new Sede;
              este.database.Sedes[key] = este.iteraModelo(modelo, data.Sedes[key]);
            })
            este.database.Ubicaciones = {}
            Object.keys(data.Ubicaciones).forEach(key=>{
              const modelo = new Ubicacion;
              este.database.Ubicaciones[key] = este.iteraModelo(modelo, data.Ubicaciones[key]);
            })
            este.database.SubUbicaciones = {}
            Object.keys(data.SubUbicaciones).forEach(key=>{
              const modelo = new SubUbicacion;
              este.database.SubUbicaciones[key] = este.iteraModelo(modelo, data.SubUbicaciones[key]);
            })
            este.database.ArticulosBase = {}
            Object.keys(data.ArticulosBase).forEach(key=>{
              const modelo = new ArticuloBase;
              este.database.ArticulosBase[key] = este.iteraModelo(modelo, data.ArticulosBase[key]);
            })
            este.database.Articulos = {}
            Object.keys(data.Articulos).forEach(key=>{
              const modelo = new Articulo;
              este.database.Articulos[key] = este.iteraModelo(modelo, data.Articulos[key]);
            })
            if(data.Sheets){
                este.database.Sheets = data.Sheets
            }
            return este.database
        }
        resumen(obj){
            this.database.Resumen = this.database.resumen(obj);
            return this.database.Resumen
        }
    // ---- Sedes --------------------------------
        sedes(){
            let este = this;
            // ojo hacer desde cloud functions
            firebase.database().ref('sedes').limitToLast(1).on('child_added', function(added){
                este.eventosSedes(added.val(),added.key,'added')
            });
            // ojo hacer desde cloud functions
            firebase.database().ref('sedes').on('child_changed', function(change){
                este.eventosSedes(change.val(),change.key,'change')
            });
            // ojo hacer desde cloud functions
            firebase.database().ref('sedes').on('child_removed', function(removed){
                delete este.database.Sedes[removed.key]
                este.storage.set('database', JSON.stringify(este.database));
                este.SedesObserver.next(este.database);
            });
        }
        eventosSedes(data:Sede,key,tipo:String){
            let este = this;
            const modelo = new Sede();
            // console.log('Sede:',key,data)
            este.database.Sedes[key] = este.iteraModelo(modelo,data);
            este.database.Sedes[key]['key'] = key;
            // este.localImagen(este.database.Sedes)
            // este.localImagen(este.database.Ubicaciones)
            // este.localImagen(este.database.SubUbicaciones)
            // este.localImagen(este.database.Articulos)
            este.database.Actualizar = true;
            este.database.total(este.database.Sedes);
            este.database.cantidad(este.database.Sedes);
            este.database.Actualizar = false;
            este.storage.set('database', JSON.stringify(este.database));
            este.SedesObserver.next(este.database);
        }
    // ---- Sheets -------------------------------
        async ExportaSheet(resumen){
            let este = this;
            // if(!this.database.Sheets){
                const alert = await this.alertController.create({
                header: 'Inventarios',
                message: 'Desea <strong>crear un reporte del resumen de su inventario</strong> en Google Sheets!!!',
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        cssClass: 'secondary',
                        handler: () => {
                            console.log('Confirm Cancel: no envio el resumen');
                        }
                    }, {
                        text: 'Si',
                        handler: async () => {
                            const sheetData = new Sheet
                            // console.log('Confirm Okay: envio el resumen');
                            const loading = await this.loadingController.create({
                                spinner:"dots",//"lines",//"circles",//"bubbles",
                                message: '...Generando archivo de resumen en Google Sheets...',
                                translucent: true,
                                cssClass: 'backRed'
                            });
                            await loading.present();
                            sheetData['titulo'] = 'General';
                            sheetData['sheets'] = ['Resumen','Inventario Detallado'];
                            sheetData['range'] = ['Resumen!A2:E','Inventario Detallado!A2:Z'];
                            let c={}
                            resumen.map(function(articulos){
                                articulos.items.map(function(articulo){
                                    sheetData['detallado'].push([
                                        articulo.creacion,
                                        articulo.modificacion,
                                        articulo.key,
                                        articulo.articulo,
                                        articulo.nombre,
                                        articulo.nombre,
                                        articulo.nombre,
                                        articulo.nombre,
                                        articulo.valor,
                                        articulo.disponibilidad,
                                        articulo.estado,
                                        articulo.imagen,
                                        articulo.observaciones,
                                        articulo.descripcion
                                    ]);
                                    if(!c[articulo.articulo]){
                                        sheetData.values.push([
                                            articulos.nombre,
                                            articulos.cantidad,
                                            articulos.Bueno,
                                            articulos.Malo,
                                            articulos.Regular
                                        ]);
                                    }
                                    c[articulo.articulo]=true;
                                })
                            });
                            let data = sheetData
                            console.log('Data a exportar',data)
                            // loading.dismiss();
                            let exportaFS = firebase.functions().httpsCallable("exportaFS");
                            return exportaFS(data).then(async function(response) {
                                // Read result of the Cloud Function.
                                // await console.log('Archivo creado: ',response);
                                sheetData['url'] = 'https://docs.google.com/spreadsheets/d/'+response.data.sheet.id+'/edit#gid=0'
                                este.sheet(sheetData)
                                let message = 'El resumen fué creado'
                                este.presentToastWithOptions(message,3000,'top')
                                loading.dismiss();
                                window.open(sheetData.url,'_blank');
                            }).catch(function(error) {
                                // Read result of the Cloud Function.
                                loading.dismiss();
                                console.log('Error en crear Reporte: ',error);
                                este.presentToastWithOptions(error.message,3000,'top')
                            })
                        }
                    }
                ]
                });
                await alert.present();
            // }else{
            //     window.open(this.database.Sheets.url,'_blank');
            //     return
            // }
        }
        sheet(data){
            let este = this;
            data.key = firebase.database().ref('sheets').push().key
            if(este.database.Sheets){
                este.database.Sheets.titulo = data.titulo
                este.database.Sheets.url = data.url
                este.database.Sheets.key = data.key
                este.database.Sheets.fecha = new Date().getTime()
                este.database.Sheets.historial[data.key]={
                    fecha: este.database.Sheets.fecha,
                    titulo: data.titulo,
                    url: data.url
                };
            }else{
                let a ={
                    titulo: data.titulo,
                    url: data.url,
                    key: data.key,
                    fecha: new Date().getTime(),
                    historial:{}
                }
                a.historial[data.key]={
                    fecha: a.fecha,
                    titulo: data.titulo,
                    url: data.url
                };
                este.database.Sheets = a;
            }
            este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                este.SedesObserver.next(este.database)
                console.log('Sheets guardados')
            })
        }
    // ---- Imagenes -----------------------------
        async update(formulario:any,articulo:Articulo,src:File | Blob,newEtiqueta:boolean) {
            let este = this
            const loading = await this.loadingController.create({
                message: 'Actualizando...'
            });
            await loading.present();
            let nombre = articulo.codigo+'.'+src['type'].substr("image/".length);
            console.log('imagen',nombre,src)
            const imagenes = firebase.storage().ref('inventario')
            .child(this.database.Sedes[articulo.sede].nombre)
            .child(this.database.Ubicaciones[articulo.ubicacion].nombre)
            .child(this.database.SubUbicaciones[articulo.subUbicacion].nombre)
            .child(nombre)
            const metadata = {
                contentType: src['type']
            };
            await imagenes.put(src,metadata).then(async function(snapshot) {
                await imagenes.getDownloadURL().then(async function(url) {
                    // hago copia de respaldo por modificación
                    let updatekey = firebase.database().ref('modificaciones').push().key
                    // ---- Actualizo la data local antes de escribirlo --------
                        articulo.imagen = url;
                        articulo.disponibilidad = formulario.disponibilidad;
                        articulo.estado = formulario.estado;
                        articulo.descripcion = formulario.descripcion;
                        articulo.observaciones = formulario.observaciones;
                        articulo.valor = formulario.valor;
                        articulo.serie = formulario.serie;
                        articulo.modificaciones = new Date().toLocaleDateString();
                        articulo.nombre = este.database.ArticulosBase[articulo.articulo].nombre;
                        este.database.Articulos[articulo.key] = articulo; // data local
                    // ---- Actualiza Etiqueta de ser necesario ----
                        if(newEtiqueta){
                            este.crearEtiqueta(articulo)
                        }
                        console.log('ojo entro!',articulo);
                    // ---- Registro de modificaciones -------------
                        firebase.database().ref('modificaciones')
                        .child(articulo.key).child(updatekey).set(articulo)
                        firebase.database().ref('modificaciones')
                        .child(articulo.key).child(updatekey).child('modificaciones').push(updatekey)
                    // ---- Actualizacion de los datos -------------
                        await firebase.database().ref('inventario2')
                        .child(articulo.key).update(articulo);
                    // ---- Actualiza la tabla de seriales ---------
                        if(articulo.serie != ''){
                            await firebase.database().ref('seriales')
                            .child(articulo.serie).set({
                                articulokey: articulo.key,
                                subUbicacionkey: articulo.subUbicacion
                            })
                        }
                    // ---- Guardo localmente ----------------------
                        este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                            loading.dismiss();
                        });
                    // ---------------------------------------------
                    return
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
                    return
                });
            });
        }
        async localImagen(array){
            let este = this
            let test = 0
            // console.log('items',array)
            for(let i in array){
                let s = array[i].imagen.substr(0,4)
                if(s != 'data'){
                    console.log(s)
                    await this.getBase64Image(array[i].imagen, function(base64image){
                        // console.log('new Imagen',base64image)
                        array[i].imagen = base64image;
                        test ++
                        if(test == array.length){
                            este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                                console.log('Termino con',array)
                            })
                        }
                    });
                }
            }
        }
        async localImagenItems(array=[],index:number){
            let este = this
            let test = 0
            console.log('items',index,array)
            this.f(array,index).then(()=>{
                este.storage.set('database', JSON.stringify(este.database)).then(()=>{
                    console.log('Termino con',array)
                })
            })
        }
        async f(array=[],index:number){
            let este = this
            for(let i in array){
                let s = array[i].imagen.substr(0,4)
                if(s != 'data'){
                    console.log(s)
                    this.download(array[i])
                }
            }
        }
        public getBase64Image(imgUrl, callback) {
            // console.log(imgUrl)
            var img = new Image();
            // onload fires when the image is fully loadded, and has width and height
        
            img.onload = function(){
              var canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              var ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              var dataURL = canvas.toDataURL("image/png")
            //   dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        
              callback(dataURL); // the base64 string
            };
            // set attributes and src 
            img.setAttribute('crossOrigin', 'anonymous'); //
            img.src = 'https://cors-anywhere.herokuapp.com/'+imgUrl;
        }
        public async download(articulo:any){//(i:any,index:any,item:any) {
            let este = this;
            // console.log(c + name + '.png',articulo)
            if (this.plataforma.cordova && this.plataforma.android) {
                return await this.downloadFile(articulo)
            }
        }
        public async checkFileExists(articulo:any){
            let este = this;
            let name = articulo.key;
            await this.file.checkFile(this.file.externalRootDirectory, 'inventarios/' + name + '.png')
			.then(_ => {
                // alert("A file with the same name already exists!");
                console.log("A file with the same name already exists!");
                return true
            })
			// File does not exist yet, we can save normally
			.catch(err =>{
                return false
            })
        }
        public async downloadFile(articulo:any){
            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            let este = this;
            let name = articulo.key;
            let file = articulo.imagen;
            let c = 'inventarios/';
            return await fileTransfer.download(file, este.file.externalRootDirectory + '/'+ c + name + '.png')
            .then((entry) => {
                return este.webview.convertFileSrc(entry.nativeURL);
            })
            .catch((err) =>{
                console.log(articulo.key,'Error saving file: ' + err.message);
                return articulo.imagen
            })
        }
        /* public async download2(articulo:any){//(i:any,index:any,item:any) {
            const fileTransfer: FileTransferObject = this.fileTransfer.create();
            let este = this;
            let name = articulo.key;
            let file = articulo.imagen;
            let c = 'inventarios/';
            // console.log(c + name + '.png',articulo)
            if (this.plataforma.cordova && this.plataforma.android) {
                return await fileTransfer.download(file, este.file.externalRootDirectory + '/'+ c + name + '.png')
                .then((entry) => {
                    // alert('File saved in:  ' + entry.nativeURL);
                    // este.database.Articulos[item.key].imagen = este.webview.convertFileSrc(entry.nativeURL);
                    // este.database.Resumen[index].items[i].imagen = este.webview.convertFileSrc(entry.nativeURL);

                    // este.database.Articulos[articulo.key].imagen = este.webview.convertFileSrc(entry.nativeURL);
                    return este.webview.convertFileSrc(entry.nativeURL);
                })
                .catch((err) =>{
                    // alert('Error saving file: ' + err.message);
                    console.log(este.looper,'Error2 saving file: ' + err.message);
                    return articulo.imagen
                })
        
            }
        } */
        async checkDir(){
            let este = this;
            return await this.file.checkDir(this.file.externalRootDirectory, 'inventarios').then(()=>{
                console.log('El directorio si existe')
            }).catch(
                // Directory does not exists, create a new one
                err => este.file.createDir(este.file.externalRootDirectory, 'inventarios', false)
                .then(response => {
                    // alert('New folder created:  ' + response.fullPath);
                    console.log('New folder created:  ' + response.fullPath);
                }).catch(err => {
                    // alert('It was not possible to create the dir "inventarios". Err: ' + err.message);
                    console.log('It was not possible to create the dir "inventarios". Err: ' + err.message);
                })			
            );
        }
    // ---- Etiquetas ----------------------------
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
                let etiqueta=[]
                // console.log(conta,i,data,'Funcion Etiqueta respondio ok: ',response);
                etiqueta['url'] = 'https://docs.google.com/presentation/d/'+response.data.etiqueta.id+'/edit' //'/export/pdf'//'https://docs.google.com/document/d/'+response.data.doc.id+'/edit'
                articulo.etiqueta = etiqueta['url']
                articulo.etiquetaId = response.data.etiqueta.id
                articulo.fechaEtiqueta = new Date().toLocaleDateString()
                este.database.Articulos[articulo.key] = articulo; // data local
                return
            }).catch(function(error) {
                // Read result of the Cloud Function.
                console.log('Error en crear Etiqueta: ',error);
                let message = 'Error en crear Etiqueta: '+error
                este.presentToastWithOptions(message,3000,'top')
                return
            })
        }
    // ---- Generales ----------------------------
        async getStorageChild(child){
            this.storage.get(child).then((val) => {
                if(val){
                    let data = val;
                    if(!this.IsJsonString(val)){
                        data = JSON.stringify(val);
                    }
                    data = JSON.parse(data);
                    console.log('Your data is '+child, JSON.parse(data));
                    return data
                }else{
                    console.log('No hay datos en el child: '+child);
                    return 'No hay datos en el child: '+child
                }
            });
        }
        IsJsonString(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }
        async presentAlert(titulo,mensaje) {
            const alert = await this.alertController.create({
            header: titulo,
            message: mensaje,
            buttons: ['OK']
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
    // -------------------------------------------
}