import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Sede, LocalDatabase, Sheet } from '../models/user-model';
import { DataService } from '../providers/data-service';
import { ScanerService } from '../providers/scaner-service';
import * as firebase from 'firebase/app';
import "firebase/functions";

@Component({
  selector: 'app-sedes',
  templateUrl: './sedes.page.html',
  styleUrls: ['./sedes.page.scss'],
})
export class SedesPage implements OnInit {
  @ViewChild('searchbar') inputElRef;
  plataforma: any = {desktop:Boolean,android:Boolean};
  objectKeys: any = Object.keys;
  database: LocalDatabase;
  toggled: boolean;
  SedesArray: any = [];
  sedesDataModel: { [key: string]: Sede };
  estados: any;
  
  constructor(
    public platform: Platform,
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
    this.plataforma = this.ds.plataforma
    this.ds.SedesObserver.subscribe((newData) => {
      // console.log('Se actualizaron las sedes',newData);
      este.actualizaSedes(newData)
    });
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
      this.actualizaSedes(this.database)
      const val = ev.target.value;
      if (val && val.trim() != '') {
        this.SedesArray = this.SedesArray.filter((ubicacion) => {
          return (ubicacion.nombre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      }
    }
  // --- Funcion para actualizar la data principal ----
    actualizaSedes(data){
      let este = this;
      // this.ds.localImagen(este.database.Sedes)
      this.ds.resumen(data.Articulos)
      this.database = this.ds.Database;
      this.estados = this.database.Estados;
      este.SedesArray = [];
      this.sedesDataModel = data.Sedes
      Object.keys(this.sedesDataModel).map(function(i){
        este.SedesArray.push(este.sedesDataModel[i]);
      });
    }
  // --- Funcion para editar una sede especifica ------
    CreateSede() {
      this.navCtrl.navigateForward(['crea-locacion',{
        accion:'crear',
        locacionChild: 'sedes'
      }]);
    }
  // --- Resumen de la institucion -------------------
    resumen(){
      this.navCtrl.navigateForward(['resumen-general',{
        locacion: 'todo'
      }]);
    }
  // --- Abre la sede ---------------------------------
    open(sede){
      this.navCtrl.navigateForward(['ubicaciones',{
        sedeNombre:sede.nombre,
        sedekey:sede.key
      }]);
    }
  // --- Exporta a Google Sheets ----------------------
    sheet(){
      this.ds.ExportaSheet(this.database.Resumen)
    }
  // --------------------------------------------------
  ngOnInit() {
    this.database = this.ds.Database;
    this.actualizaSedes(this.database)
    console.log('ngOnInit',this.database)
2  }
}
