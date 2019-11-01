import { Injectable, NgZone } from '@angular/core';
import { Platform, AlertController, LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Injectable()
export class ScanerService {
    scanData: { subkey: string; artkey: string; };
    constructor(
        public platform: Platform,
        public alertController: AlertController,
        public router: Router,
        public loadingController: LoadingController,
        public ngZone: NgZone, // NgZone service to remove outside scope warning 
        private storage: Storage,
        private Scanner: BarcodeScanner,
        public navCtrl: NavController,
    ) { }
    // --- Escarner de BarCode y QR ---------------------
        escanear(){
            // subUbicacion%3D-L_Z3Uw_56THWtGrdcSW%26ingreso%3D-L_doWHLU9J9fg1Smidc%26
            this.Scanner.scan().then(async barcodeData => {
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
    // --- set serial ----------------------------------
        getSerial(){
            this.Scanner.scan().then(barcodeData => {
                return barcodeData
                // this.scanData = barcodeData.text;
                // let data = this.newIngresoForm.value
                // data['serie'] = barcodeData.text;
                // this.articulos['serie'] = barcodeData.text;
                // console.log('Barcode data', barcodeData);
                // console.log('Form data', data);
                // this.creaFormulario(data)
            }).catch(err => {
                console.log('Error escaner seriales', err);
            });
        }
    // --------------------------------------------------
    
}