import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ImageUploaderComponent],
  // ENSURE THIS MATCHES YOUR FILE NAME EXACTLY
  templateUrl: './app.html', 
  styleUrls: ['./app.component.css'] // or leave as []
})
export class AppComponent { }