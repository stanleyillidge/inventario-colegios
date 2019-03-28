import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreaLocacionPage } from './crea-locacion.page';

const routes: Routes = [
  {
    path: '',
    component: CreaLocacionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CreaLocacionPage]
})
export class CreaLocacionPageModule {}
