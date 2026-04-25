import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item'; 
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-item.html',
  styleUrls: ['./post-item.css']
})
export class PostItemComponent {
  title: string = '';
  description: string = '';
  status: string = 'lost';
  category: string = '1'; 
  location: string = '';

  selectedFiles: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];

  constructor(
    private itemService: ItemService, 
    private authService: AuthService, 
    private router: Router
  ) {}

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number, event: Event) {
    event.stopPropagation();
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  submitForm() {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('location', this.location);
    formData.append('category', this.category);
    formData.append('status', 'available');
    const formattedType = this.status.charAt(0).toUpperCase() + this.status.slice(1); 
    formData.append('type', formattedType); 
    this.selectedFiles.forEach((file) => {
      formData.append('uploaded_images', file, file.name); 
    });
    this.itemService.createItem(formData).subscribe({
      next: () => {
        alert('Объявление успешно создано через FormData!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Ошибка бэкенда:', err);
        alert('Ошибка! Загляни в консоль (F12), там написано, что не нравится Django.');
      }
    });
  }
}