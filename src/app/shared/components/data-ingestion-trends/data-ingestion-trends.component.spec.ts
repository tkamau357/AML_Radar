import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIngestionTrendsComponent } from './data-ingestion-trends.component';

describe('DataIngestionTrendsComponent', () => {
  let component: DataIngestionTrendsComponent;
  let fixture: ComponentFixture<DataIngestionTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataIngestionTrendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIngestionTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
