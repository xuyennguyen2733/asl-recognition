import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlphabetCameraComponent } from './alphabet-camera.component';

describe('AlphabetCameraComponent', () => {
  let component: AlphabetCameraComponent;
  let fixture: ComponentFixture<AlphabetCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlphabetCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlphabetCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
