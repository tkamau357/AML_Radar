import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningDialog } from './screening-dialog';

describe('ScreeningDialog', () => {
  let component: ScreeningDialog;
  let fixture: ComponentFixture<ScreeningDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
