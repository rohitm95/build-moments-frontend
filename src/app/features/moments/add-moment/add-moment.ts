import { Component, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

export interface UploadingFile {
  id: number;
  name: string;
  iconType: 'image' | 'text';
  progress: number;
  size: string;
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

  uploadingFiles = signal<UploadingFile[]>([
    { id: 1, name: 'Photo.png', iconType: 'image', progress: 38, size: '6.5 mb' },
    { id: 2, name: 'file.txt', iconType: 'text', progress: 45, size: '2.5 mb' },
  ]);

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
    // Simulate progress
    newFiles.forEach((f) => this.simulateProgress(f.id));
  }

  private simulateProgress(id: number) {
    const interval = setInterval(() => {
      this.uploadingFiles.update((files) =>
        files.map((f) => {
          if (f.id === id) {
            const next = Math.min(f.progress + Math.random() * 10, 100);
            if (next >= 100) clearInterval(interval);
            return { ...f, progress: Math.round(next) };
          }
          return f;
        })
      );
    }, 400);
  }

  private formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} mb` : `${(bytes / 1024).toFixed(0)} kb`;
  }

  onSubmit() {
    console.log('Submitting moment:', {
      title: this.title(),
      tags: this.tags(),
    });
  }
}
