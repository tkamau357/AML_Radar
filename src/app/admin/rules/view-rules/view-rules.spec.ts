import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRules } from './view-rules';

describe('ViewRules', () => {
  let component: ViewRules;
  let fixture: ComponentFixture<ViewRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
