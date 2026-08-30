import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBranchComponent } from './view-branch-component';

describe('ViewBranchComponent', () => {
  let component: ViewBranchComponent;
  let fixture: ComponentFixture<ViewBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBranchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBranchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
