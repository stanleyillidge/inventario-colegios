import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenArticuloPage } from './resumen-articulo.page';

describe('ResumenArticuloPage', () => {
  let component: ResumenArticuloPage;
  let fixture: ComponentFixture<ResumenArticuloPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumenArticuloPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenArticuloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
