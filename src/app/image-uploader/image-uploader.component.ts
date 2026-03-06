import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ScanResult {
  image?: string;
  employee_number: string;
  name: string;
  last_name: string;
  day_of_week_number: number;
  type_of_schedule: string;
  day_of_week: string;
  date: string;
  type_of_shift: string;
  rest: string;
}

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.css']
})
export class ImageUploaderComponent {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  isCameraOpen = signal<boolean>(false);
  selectedFiles = signal<File[]>([]);
  imagePreviews = signal<string[]>([]);
  scanResults = signal<ScanResult[]>([]); // To store multiple results

  constructor(private http: HttpClient) {}

  // --- CAMERA LOGIC ---
  async startCamera() {
    this.isCameraOpen.set(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Could not access camera.");
    }
  }

  capturePhoto() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          // 1. Create a unique name for this specific capture
          const timestamp = new Date().getTime();
          const file = new File([blob], `camera-cap-${timestamp}.png`, { type: "image/png" });
  
          // 2. Add this new file to our existing list of files
          this.selectedFiles.update(current => [...current, file]);
  
          // 3. Add the preview string so it shows up in the gallery
          const previewUrl = canvas.toDataURL('image/png');
          this.imagePreviews.update(previews => [...previews, previewUrl]);
  
          // 4. Close the camera so the user can see the gallery
          this.stopCamera();
        }
      }, 'image/png');
    }
  }

  stopCamera() {
    const stream = this.videoElement.nativeElement.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    this.isCameraOpen.set(false);
  }

  // --- UPLOAD LOGIC ---
  onFilesSelected(event: any) {
    const files: FileList = event.target.files; // Access the whole list
    if (files && files.length > 0) {
      const newFiles = Array.from(files); // Convert FileList to Array
      this.selectedFiles.update(current => [...current, ...newFiles]);
  
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.update(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }
  
  // --- UPDATED BULK UPLOAD LOGIC ---
  async uploadAll() {
    const filesToUpload = this.selectedFiles();
    const previews = this.imagePreviews(); // Get the previews we already generated
    
    if (filesToUpload.length === 0) return;
  
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const preview = previews[i]; // Get the matching preview for this file
  
      const formData = new FormData();
      formData.append('image', file, file.name);
  
      try {
        const result = await this.http.post<ScanResult>('http://localhost:8080/upload', formData).toPromise();
        
        if (result) {
          // 2. Attach the preview URL to the result object before saving it
          result.image = preview; 
          this.scanResults.update(results => [...results, result]);
        }
      } catch (err) {
        console.error(`Error processing ${file.name}`, err);
      }
    }
  
    // Clear the queue so the user can pick new ones, 
    // but the 'scanResults' will keep the old ones visible!
    this.selectedFiles.set([]);
    this.imagePreviews.set([]);
  }
  
  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    this.imagePreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  saveChanges() {
    const finalData = this.scanResults();
    console.log('Final Corrected Data:', finalData);
    // You can send this back to Go here using this.http.post(...)
    alert('Changes saved to console!');
    this.scanResults.set([]);
  }

  // 1. Add this signal at the top with your others
enlargedImage = signal<string | null>(null);

// 2. Add these functions inside the class
openLargePreview(imageUrl: string | undefined) {
  if (imageUrl) {
    this.enlargedImage.set(imageUrl);
  }
}

closeLargePreview() {
  this.enlargedImage.set(null);
}
}