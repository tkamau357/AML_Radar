import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineConfig } from './engine-config';

describe('EngineConfig', () => {
  let component: EngineConfig;
  let fixture: ComponentFixture<EngineConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngineConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
