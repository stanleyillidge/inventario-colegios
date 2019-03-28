import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreaLocacionPage } from './crea-locacion.page';

describe('CreaLocacionPage', () => {
  let component: CreaLocacionPage;
  let fixture: ComponentFixture<CreaLocacionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreaLocacionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreaLocacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
