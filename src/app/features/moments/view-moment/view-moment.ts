import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Moment as MomentService } from '../../../core/services/moment';

export interface MomentDetails {
  id: string;
  title: string;
  tags: string[];
  files: string[];
}

@Component({
  selector: 'app-view-moment',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatRippleModule, MatSnackBarModule],
  templateUrl: './view-moment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './view-moment.scss',
})
export class ViewMoment implements OnInit {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly momentService = inject(MomentService);
  readonly snackBar = inject(MatSnackBar);

  moment = signal<MomentDetails | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadMoment(id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  async loadMoment(id: string) {
    try {
      const data = await this.momentService.getMoment(id);
      if (data) {
        this.moment.set({
          id: data.id,
          title: data.title,
          tags: data.tags,
          files: data.files,
        });
      } else {
        this.snackBar.open('Moment not found.', 'Close', { duration: 3000 });
        this.router.navigate(['/moments']);
      }
    } catch (error) {
      console.error('Failed to load moment detail', error);
      this.snackBar.open('Error loading moment.', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  onBack() {
    this.router.navigate(['/moments']);
  }

  onEdit() {
    const current = this.moment();
    if (current) {
      this.router.navigate(['/moments/edit', current.id]);
    }
  }

  async onDelete() {
    const current = this.moment();
    if (current && confirm(`Are you sure you want to delete "${current.title}"?`)) {
      try {
        await this.momentService.deleteMoment(current.id);
        this.snackBar.open('Moment deleted successfully.', 'Close', { duration: 3000 });
        this.router.navigate(['/moments']);
      } catch (error) {
        console.error('Failed to delete moment', error);
        this.snackBar.open('Failed to delete moment.', 'Close', { duration: 3000 });
      }
    }
  }

  isImageFile(url: string): boolean {
    const low = url.toLowerCase();
    return low.endsWith('.png') || 
           low.endsWith('.jpg') || 
           low.endsWith('.jpeg') || 
           low.endsWith('.gif') || 
           url.includes('alt=media');
  }

  getFileName(url: string): string {
    const decodedUrl = decodeURIComponent(url);
    const namePart = decodedUrl.split('/').pop()?.split('?')[0] || 'File';
    return namePart.includes('_') ? namePart.split('_').slice(1).join('_') : namePart;
  }
}
