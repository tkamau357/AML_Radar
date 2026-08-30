import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAuditDetailsComponent } from './view-audit-details.component';

describe('ViewAuditDetailsComponent', () => {
  let component: ViewAuditDetailsComponent;
  let fixture: ComponentFixture<ViewAuditDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAuditDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAuditDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
