import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  { path: 'sedes', loadChildren: './sedes/sedes.module#SedesPageModule' },
  { path: 'ubicaciones', loadChildren: './ubicaciones/ubicaciones.module#UbicacionesPageModule' },
  { path: 'articulos-ubicacion', loadChildren: './articulos-ubicacion/articulos-ubicacion.module#ArticulosUbicacionPageModule' },
  { path: 'sub-ubicaciones', loadChildren: './sub-ubicaciones/sub-ubicaciones.module#SubUbicacionesPageModule' },
  { path: 'ingreso', loadChildren: './ingreso/ingreso.module#IngresoPageModule' },
  { path: 'articulo-ingreso', loadChildren: './articulo-ingreso/articulo-ingreso.module#ArticuloIngresoPageModule' },
  { path: 'inventario-sububicacion', loadChildren: './inventario-sububicacion/inventario-sububicacion.module#InventarioSububicacionPageModule' },
  { path: 'view-articulo', loadChildren: './view-articulo/view-articulo.module#ViewArticuloPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
