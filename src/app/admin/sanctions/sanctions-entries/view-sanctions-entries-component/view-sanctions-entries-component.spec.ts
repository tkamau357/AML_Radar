import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSanctionsEntriesComponent } from './view-sanctions-entries-component';

describe('ViewSanctionsEntriesComponent', () => {
  let component: ViewSanctionsEntriesComponent;
  let fixture: ComponentFixture<ViewSanctionsEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSanctionsEntriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSanctionsEntriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
