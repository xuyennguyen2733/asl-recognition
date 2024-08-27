import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediapipeDemoComponent } from './mediapipe-demo.component';

describe('MediapipeDemoComponent', () => {
  let component: MediapipeDemoComponent;
  let fixture: ComponentFixture<MediapipeDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediapipeDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediapipeDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
