import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SanctionsEntriesComponent } from './sanctions-entries-component';

describe('SanctionsEntriesComponent', () => {
  let component: SanctionsEntriesComponent;
  let fixture: ComponentFixture<SanctionsEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanctionsEntriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SanctionsEntriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
