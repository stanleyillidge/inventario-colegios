import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SubUbicacionesPage } from './sub-ubicaciones.page';

const routes: Routes = [
  {
    path: '',
    component: SubUbicacionesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SubUbicacionesPage]
})
export class SubUbicacionesPageModule {}
