import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAlerts } from './add-alerts';

describe('AddAlerts', () => {
  let component: AddAlerts;
  let fixture: ComponentFixture<AddAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAlerts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
