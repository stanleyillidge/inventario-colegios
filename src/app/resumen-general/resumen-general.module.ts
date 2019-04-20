import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ResumenGeneralPage } from './resumen-general.page';

const routes: Routes = [
  {
    path: '',
    component: ResumenGeneralPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ResumenGeneralPage]
})
export class ResumenGeneralPageModule {}
