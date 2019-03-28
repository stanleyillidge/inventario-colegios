import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './auth-guard-service.service';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'login',
  //   pathMatch: 'full'
  // },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  { path: 'sedes', loadChildren: './sedes/sedes.module#SedesPageModule', canActivate: [AuthGuardService] },
  { path: 'ubicaciones', loadChildren: './ubicaciones/ubicaciones.module#UbicacionesPageModule' },
  { path: 'articulos-ubicacion', loadChildren: './articulos-ubicacion/articulos-ubicacion.module#ArticulosUbicacionPageModule', canActivate: [AuthGuardService] },
  { path: 'sub-ubicaciones', loadChildren: './sub-ubicaciones/sub-ubicaciones.module#SubUbicacionesPageModule' },
  { path: 'ingreso', loadChildren: './ingreso/ingreso.module#IngresoPageModule' },
  { path: 'articulo-ingreso', loadChildren: './articulo-ingreso/articulo-ingreso.module#ArticuloIngresoPageModule' },
  { path: 'inventario-sububicacion', loadChildren: './inventario-sububicacion/inventario-sububicacion.module#InventarioSububicacionPageModule' },
  { path: 'view-articulo', loadChildren: './view-articulo/view-articulo.module#ViewArticuloPageModule' },
  { path: 'edita-path', loadChildren: './edita-path/edita-path.module#EditaPathPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'crea-locacion', loadChildren: './crea-locacion/crea-locacion.module#CreaLocacionPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
