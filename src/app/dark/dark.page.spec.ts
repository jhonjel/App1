import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DarkPage } from './dark.page';

describe('DarkPage', () => {
  let component: DarkPage;
  let fixture: ComponentFixture<DarkPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DarkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
