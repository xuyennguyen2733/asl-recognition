import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlphabetCameraComponent } from './alphabet-camera/alphabet-camera.component';
import { MediapipeDemoComponent } from './mediapipe-demo/mediapipe-demo.component';

@NgModule({
  declarations: [
    AppComponent,
    AlphabetCameraComponent,
    MediapipeDemoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
