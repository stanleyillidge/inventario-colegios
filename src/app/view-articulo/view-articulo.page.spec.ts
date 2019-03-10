import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewArticuloPage } from './view-articulo.page';

describe('ViewArticuloPage', () => {
  let component: ViewArticuloPage;
  let fixture: ComponentFixture<ViewArticuloPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewArticuloPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewArticuloPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
