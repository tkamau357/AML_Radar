import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRules } from './add-rules';

describe('AddRules', () => {
  let component: AddRules;
  let fixture: ComponentFixture<AddRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRules]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
