import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSanctionsEntriesComponent } from './add-sanctions-entries-component';

describe('AddSanctionsEntriesComponent', () => {
  let component: AddSanctionsEntriesComponent;
  let fixture: ComponentFixture<AddSanctionsEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSanctionsEntriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSanctionsEntriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
