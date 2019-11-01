import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, Platform, LoadingController, ToastController } from '@ionic/angular';
import { Sede, LocalDatabase } from '../models/user-model';
import { DataService } from '../providers/data-service';
import { ScanerService } from '../providers/scaner-service';


@Component({
  selector: 'app-resumen-articulo',
  templateUrl: './resumen-articulo.page.html',
  styleUrls: ['./resumen-articulo.page.scss'],
})
export class ResumenArticuloPage implements OnInit {
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
  index: number;
  articulo: any;
  
  constructor(
    public platform: Platform,
    public route: ActivatedRoute,
    public router: Router,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public toastController: ToastController,
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
  // ---- Abre el detalle del articulo ----------------
    detalle(articulo){
      console.log('Articulo a detallar',articulo)
      this.navCtrl.navigateForward(['view-articulo',{
        articulokey: articulo.key,
        articulo: articulo.articulo
      }]);
    }
  // --------------------------------------------------
  async ngOnInit() {
    let este = this;
    this.index = JSON.parse(this.route.snapshot.paramMap.get('index'));
    this.plataforma = this.ds.plataforma
    this.database = this.ds.Database;
    this.estados = this.database.Estados
    // this.ds.localImagenItems(this.database.Resumen[this.index].items,this.index)
    const loading = await this.loadingController.create({
      // duration: 1500,
      spinner:"dots",//"lines",//"circles",//"bubbles",
      // showBackdrop:false,
      // message: 'Creando contrato...',
      translucent: true,
      cssClass: 'backRed'
    });
    await loading.present();
    this.database = this.ds.Database;
    this.articulo = this.database.Resumen[this.index];
    console.log('Articulo res',this.articulo);
    this.resumenArray = this.articulo.items;
    this.resumenArrayT = this.resumenArray;
    loading.dismiss();
    console.log('ngOnInit',this.database)
  }
}
