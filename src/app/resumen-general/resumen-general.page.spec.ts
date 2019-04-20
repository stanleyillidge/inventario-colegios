import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenGeneralPage } from './resumen-general.page';

describe('ResumenGeneralPage', () => {
  let component: ResumenGeneralPage;
  let fixture: ComponentFixture<ResumenGeneralPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumenGeneralPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenGeneralPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
