import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRolesComponent } from './view-roles.component';

describe('ViewRolesComponent', () => {
  let component: ViewRolesComponent;
  let fixture: ComponentFixture<ViewRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRolesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
