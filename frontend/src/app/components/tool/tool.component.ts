import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ToolComponent {
  isConnected = false;
  images: string[] = [];
  downloading: string = '';
  downloadProgress = 0;
  isLoading = false;
  loadProgress = 0;
  hasFetched = false;

  images1: string[] = [];
  showImages = false;

  constructor(private http: HttpClient) {}

  connectDevice() {
    this.http.get<any>('http://localhost:3000/connect').subscribe({
      next: (res) => {
        this.isConnected = res.success;
        this.hasFetched = false;
        this.showImages = false;
        alert(res.message);
      },
      error: () => alert("Connection failed")
    });
  }

  fetchImages() {
    if (!this.isConnected) return alert("Connect first!");

    this.showImages = false;         // Hide local images
    this.isLoading = true;
    this.hasFetched = true;
    this.loadProgress = 0;
    this.images = [];

    const fakeProgress = setInterval(() => {
      if (this.loadProgress < 90) {
        this.loadProgress += 10;
      }
    }, 150);

    this.http.get<{ success: boolean; images: string[] }>('http://localhost:3000/images')
      .subscribe({
        next: (res) => {
          clearInterval(fakeProgress);
          this.loadProgress = 100;
          setTimeout(() => {
            this.isLoading = false;
          }, 300);

          if (res.success) {
            this.images = res.images;
          } else {
            alert('No images found');
          }
        },
        error: (err) => {
          clearInterval(fakeProgress);
          this.isLoading = false;
          console.error('Error fetching images:', err);
          alert('Failed to fetch images');
        }
      });
  }
  fetchImages1() {
    if (this.showImages) return;  // Prevent fetching if images are already shown

    
    
    this.images1 = [
      'images/img10.jpg',
      'images/img12.jpg',
      'images/img7.jpeg',
      'images/img8.jpg',
      'images/img-1.jpg',
      'images/img-2.jpg',
      'images/img-3.jpg'
    ];
    console.log("Fetching local images", this.images1);

    this.showImages = true;
  }
  
  
  trackByFn(index: number, item: string): string {
    return item; // Return unique identifier for each image (the path or filename)
  }
  

  downloadImage(path: string) {
    this.downloading = path;
    this.downloadProgress = 10;

    const link = document.createElement('a');
    link.href = `http://localhost:3000/download?file=${encodeURIComponent(path)}`;
    link.download = path.split('/').pop() || 'image';
    link.click();

    const interval = setInterval(() => {
      if (this.downloadProgress >= 100) {
        clearInterval(interval);
        this.downloading = '';
      } else {
        this.downloadProgress += 10;
      }
    }, 150);
  }

  encode(str: string): string {
    return encodeURIComponent(str);
  }
}
