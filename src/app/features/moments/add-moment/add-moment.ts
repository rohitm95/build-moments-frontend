import { Component, signal, ElementRef, ViewChild, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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

export interface FilePreview {
  file: File;
  preview?: string;
  iconType: 'image' | 'text';
}

@Component({
  selector: 'app-add-moment',
  imports: [CommonModule, FormsModule, MatProgressBarModule, MatButtonModule, MatRippleModule, MatSnackBarModule],
  templateUrl: './add-moment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './add-moment.scss',
})
export class AddMoment implements OnInit {
  readonly snackBar = inject(MatSnackBar);
  readonly route = inject(ActivatedRoute);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dropZone') dropZone!: ElementRef<HTMLDivElement>;

  momentId: string | null = null;
  title = signal('');
  tagInput = signal('');
  tags = signal<string[]>([]);
  isDragOver = signal(false);
  isSubmitting = signal(false);

  uploadingFiles = signal<UploadingFile[]>([]);
  showPreview = signal(false);
  previewFile = signal<FilePreview | null>(null);

  readonly momentService = inject(MomentService);
  readonly router = inject(Router);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.momentId = id;
        this.loadMoment(id);
      }
    });
  }

  async loadMoment(id: string) {
    try {
      const moment = await this.momentService.getMoment(id);
      if (moment) {
        this.title.set(moment.title);
        this.tags.set(moment.tags);
        
        // Map files
        const files: UploadingFile[] = (moment.files || []).map((url: string, index: number) => {
          const decodedUrl = decodeURIComponent(url);
          const namePart = decodedUrl.split('/').pop()?.split('?')[0] || `File ${index + 1}`;
          const cleanName = namePart.includes('_') ? namePart.split('_').slice(1).join('_') : namePart;
          const isImg = url.toLowerCase().endsWith('.png') || 
                        url.toLowerCase().endsWith('.jpg') || 
                        url.toLowerCase().endsWith('.jpeg') || 
                        url.toLowerCase().endsWith('.gif') || 
                        url.includes('alt=media');
          return {
            id: index,
            name: cleanName,
            iconType: isImg ? 'image' : 'text',
            progress: 100,
            size: 'Uploaded',
            url: url
          };
        });
        this.uploadingFiles.set(files);
      }
    } catch (error) {
      console.error('Failed to load moment detail', error);
      this.snackBar.open('Failed to load moment details.', 'Close', { duration: 3000 });
    }
  }

  addTag(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.key === ' ') {
        event.preventDefault();
      }
      this.createTagFromInput();
    }
  }

  onBlur() {
    this.createTagFromInput();
  }

  private createTagFromInput() {
    const val = this.tagInput().trim();
    if (val && !this.tags().includes(val)) {
      this.tags.update((tags) => [...tags, val]);
    }
    this.tagInput.set('');
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
    if (input.files && input.files.length > 0) {
      this.showFilePreview(input.files[0]);
    }
  }

  private showFilePreview(file: File) {
    const iconType = file.type.startsWith('image/') ? 'image' : 'text';
    const preview: FilePreview = { file, iconType };

    if (iconType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.preview = e.target?.result as string;
        this.previewFile.set(preview);
        this.showPreview.set(true);
      };
      reader.readAsDataURL(file);
    } else {
      this.previewFile.set(preview);
      this.showPreview.set(true);
    }
  }

  confirmUpload() {
    const file = this.previewFile()?.file;
    if (file) {
      this.addFiles([file]);
      this.cancelPreview();
    }
  }

  cancelPreview() {
    this.showPreview.set(false);
    this.previewFile.set(null);
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
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.showFilePreview(event.dataTransfer.files[0]);
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
    
    // Reset file input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
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

  formatPreviewFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  }

  async onSubmit() {
    this.isSubmitting.set(true);
    const uploadedUrls = this.uploadingFiles()
      .filter(f => f.url)
      .map(f => f.url as string);

    try {
      if (this.momentId) {
        await this.momentService.updateMoment(this.momentId, {
          title: this.title(),
          tags: this.tags(),
          files: uploadedUrls
        });
        this.snackBar.open('Moment updated successfully!', 'Close', { duration: 3000 });
      } else {
        await this.momentService.createMoment({
          title: this.title(),
          tags: this.tags(),
          files: uploadedUrls
        });
        this.snackBar.open('Moment created successfully!', 'Close', { duration: 3000 });
      }
      this.router.navigate(['/moments']);
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onBack() {
    this.router.navigate(['/moments']);
  }
}
