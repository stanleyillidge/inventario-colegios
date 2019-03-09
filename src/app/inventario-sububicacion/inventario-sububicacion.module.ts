import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InventarioSububicacionPage } from './inventario-sububicacion.page';

const routes: Routes = [
  {
    path: '',
    component: InventarioSububicacionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InventarioSububicacionPage]
})
export class InventarioSububicacionPageModule {}
