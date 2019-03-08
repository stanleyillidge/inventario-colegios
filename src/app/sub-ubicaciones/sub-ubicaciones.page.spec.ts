import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubUbicacionesPage } from './sub-ubicaciones.page';

describe('SubUbicacionesPage', () => {
  let component: SubUbicacionesPage;
  let fixture: ComponentFixture<SubUbicacionesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubUbicacionesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubUbicacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
