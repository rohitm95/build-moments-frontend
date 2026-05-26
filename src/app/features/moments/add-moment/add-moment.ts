import { Component, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { Moment as MomentService } from '../../../core/services/moment';

export interface UploadingFile {
  id: number;
  name: string;
  iconType: 'image' | 'text';
  progress: number;
  size: string;
  url?: string;
  error?: any;
}

@Component({
  selector: 'app-add-moment',
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatButtonModule, MatRippleModule],
  templateUrl: './add-moment.html',
  styleUrl: './add-moment.scss',
})
export class AddMoment {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dropZone') dropZone!: ElementRef<HTMLDivElement>;

  title = signal('Sample title');
  tagInput = signal('');
  tags = signal<string[]>(['tag 1']);
  isDragOver = signal(false);
  isSubmitting = signal(false);

  uploadingFiles = signal<UploadingFile[]>([]);

  private momentService = inject(MomentService);
  private router = inject(Router);

  addTag(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const val = this.tagInput().trim();
      if (val && !this.tags().includes(val)) {
        this.tags.update((tags) => [...tags, val]);
      }
      this.tagInput.set('');
    }
  }

  removeTag(tag: string) {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  removeFile(id: number) {
    this.uploadingFiles.update((files) => files.filter((f) => f.id !== id));
  }

  onBrowseClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave() {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  private addFiles(files: File[]) {
    const newFiles: UploadingFile[] = files.map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      iconType: file.type.startsWith('image/') ? 'image' : 'text',
      progress: 0,
      size: this.formatSize(file.size),
    }));
    this.uploadingFiles.update((existing) => [...existing, ...newFiles]);
    
    files.forEach((file, index) => {
      this.startUpload(file, newFiles[index].id);
    });
  }

  private startUpload(file: File, id: number) {
    this.momentService.uploadFile(file).subscribe({
      next: (res: any) => {
        this.uploadingFiles.update(files => files.map(f => {
          if (f.id === id) {
            return { ...f, progress: res.progress, url: res.downloadUrl };
          }
          return f;
        }));
      },
      error: (err: any) => {
        this.uploadingFiles.update(files => files.map(f => {
          if (f.id === id) {
            return { ...f, error: err };
          }
          return f;
        }));
      }
    });
  }

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} mb` : `${(bytes / 1024).toFixed(0)} kb`;
  }

  async onSubmit() {
    this.isSubmitting.set(true);
    const uploadedUrls = this.uploadingFiles()
      .filter(f => f.url)
      .map(f => f.url as string);

    try {
      await this.momentService.createMoment({
        title: this.title(),
        tags: this.tags(),
        files: uploadedUrls
      });
      this.router.navigate(['/moments']);
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
