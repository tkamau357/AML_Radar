import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleWarningComponent } from './idle-warning-component';

describe('IdleWarningComponent', () => {
  let component: IdleWarningComponent;
  let fixture: ComponentFixture<IdleWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdleWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdleWarningComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
