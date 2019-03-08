import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticuloIngresoPage } from './articulo-ingreso.page';

describe('ArticuloIngresoPage', () => {
  let component: ArticuloIngresoPage;
  let fixture: ComponentFixture<ArticuloIngresoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticuloIngresoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticuloIngresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
