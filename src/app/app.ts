import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Import the actual component class
import { ImageUploaderComponent } from './image-uploader/image-uploader.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ImageUploaderComponent], 
  templateUrl: './app.html',
  styles: [] // Use "styles" (plural) with an empty array instead
})
export class App {
  title = 'angular-image-processor';
}