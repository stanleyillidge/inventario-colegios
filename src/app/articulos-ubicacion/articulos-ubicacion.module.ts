import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ArticulosUbicacionPage } from './articulos-ubicacion.page';

const routes: Routes = [
  {
    path: '',
    component: ArticulosUbicacionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticulosUbicacionPage]
})
export class ArticulosUbicacionPageModule {}
