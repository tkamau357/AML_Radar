import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAlerts } from './view-alerts';

describe('ViewAlerts', () => {
  let component: ViewAlerts;
  let fixture: ComponentFixture<ViewAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAlerts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
