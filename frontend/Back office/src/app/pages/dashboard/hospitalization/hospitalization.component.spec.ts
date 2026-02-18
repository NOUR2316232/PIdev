import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalizationComponent } from './hospitalization.component';

describe('Hospitalization', () => {
  let component: HospitalizationComponent;
  let fixture: ComponentFixture<HospitalizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HospitalizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalizationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
