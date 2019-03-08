import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SedesPage } from './sedes.page';

describe('SedesPage', () => {
  let component: SedesPage;
  let fixture: ComponentFixture<SedesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SedesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SedesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
