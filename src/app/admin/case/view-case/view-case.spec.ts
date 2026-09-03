import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCase } from './view-case';

describe('ViewCase', () => {
  let component: ViewCase;
  let fixture: ComponentFixture<ViewCase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCase);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
