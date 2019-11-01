import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Sede, LocalDatabase } from '../models/user-model';
import { DataService } from '../providers/data-service';
import { ScanerService } from '../providers/scaner-service';

@Component({
  selector: 'app-resumen-general',
  templateUrl: './resumen-general.page.html',
  styleUrls: ['./resumen-general.page.scss'],
})
export class ResumenGeneralPage {
  @ViewChild('searchbar') inputElRef;
  plataforma: any = {desktop:Boolean,android:Boolean};
  objectKeys: any = Object.keys;
  database: LocalDatabase;
  toggled: boolean;
  estados: any;
  locacion: any;
  articulosArray: any;
  resumenArray: any;
  resumenArrayT: any;
  
  constructor(
    public platform: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    private nativeStorage: NativeStorage,
    public ds: DataService,
    private scanner: ScanerService
  ) {
    let este = this
    // this.ngOnInit();
  }
  public toggle(): void {
    this.toggled = !this.toggled;
    setTimeout(() => {
      this.inputElRef.setFocus()
    }, 50);
  }
  public onBlur(ev:any): void {
    this.toggled = !this.toggled;
  }
  // --- Escaner Service ------------------------------
    escaner(){
      this.scanner.escanear();
    }
  // --- Funcion para filtrar la vista principal ------
    onInput(ev:any){
      let este = this;
      this.resumenArray = this.resumenArrayT;
      const val = ev.target.value;
      if (val && val.trim() != '') {
        this.resumenArray = this.resumenArray.filter((ubicacion) => {
          return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
  // --- Funcion para actualizar la data principal ----
    async actualizaData(data){
      let este = this;
      this.database = data;
      this.estados = this.database.Estados;
      // console.log(this.database.Actualizar || !this.database.Resumen,!this.database.Resumen)
      if(this.database.Actualizar || !this.database.Resumen){
        console.log('entro al resumen')
        this.database.Resumen = this.ds.resumen(this.database.Articulos);
      }
      this.resumenArray = this.database.Resumen;
      this.resumenArrayT = this.database.Resumen;
      return true
    }
  // --------------------------------------------------
    resumenArticulo(articulo,i){
      console.log('Resumen art',i,articulo)
      // articulo = JSON.stringify(this.resumenArray[i])
      this.navCtrl.navigateForward(['resumen-articulo',{
        index: i
      }]);
    }
    sheet(){
      this.ds.ExportaSheet(this.database.Resumen)
    }
  // --------------------------------------------------
  async ngOnInit() {
    let este = this;
    const loading = await this.loadingController.create({
      // duration: 1500,
      spinner:"dots",//"lines",//"circles",//"bubbles",
      // showBackdrop:false,
      // message: 'Creando contrato...',
      translucent: true,
      cssClass: 'backRed'
    });
    await loading.present();
    this.plataforma = this.ds.plataforma
    this.database = this.ds.Database;
    this.locacion = this.route.snapshot.paramMap.get('locacion')
    this.actualizaData(this.database).then(()=>{
      loading.dismiss();
    })
    console.log('ngOnInit',this.database)
  }
}