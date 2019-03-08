import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ArticuloIngresoPage } from './articulo-ingreso.page';

const routes: Routes = [
  {
    path: '',
    component: ArticuloIngresoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ArticuloIngresoPage]
})
export class ArticuloIngresoPageModule {}
