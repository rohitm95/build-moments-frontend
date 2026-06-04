import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Moment as MomentService } from '../../../core/services/moment';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

export interface MomentItem {
  id: string;
  imageUrl: string;
  title: string;
  tags: string[];
  files: string[];
}

@Component({
  selector: 'app-moment-list',
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './moment-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './moment-list.scss',
})
export class MomentList implements OnInit {
  readonly momentService = inject(MomentService);
  readonly snackBar = inject(MatSnackBar);
  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);

  moments = signal<MomentItem[]>([]);
  isLoading = signal(false);

  readonly pageSizeOptions = [7, 10, 15, 25];
  pageSize = signal(7);
  currentPage = signal(1);

  readonly totalItems = computed(() => this.moments().length);

  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  readonly pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.moments().slice(start, start + this.pageSize());
  });

  readonly rangeLabel = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0-0 Of 0';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `${start}-${end} Of ${total}`;
  });

  ngOnInit() {
    this.loadMoments();
  }

  async loadMoments() {
    this.isLoading.set(true);
    try {
      const data = await this.momentService.getMoments();
      const mapped: MomentItem[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        tags: [...item.tags], // Make copy so it's mutable locally if needed
        files: item.files,
        imageUrl: item.files && item.files.length > 0 ? item.files[0] : 'https://placehold.co/100x100?text=Moment'
      }));
      this.moments.set(mapped);
    } catch (err) {
      console.error('Failed to load moments', err);
      this.snackBar.open('Failed to load moments.', 'Close', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }

  onEdit(moment: MomentItem) {
    this.router.navigate(['/moments/edit', moment.id]);
  }

  onView(moment: MomentItem) {
    this.router.navigate(['/moments', moment.id]);
  }

  onDelete(moment: MomentItem) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Moment',
        message: `Are you sure you want to delete "${moment.title}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.momentService.deleteMoment(moment.id);
          this.moments.update((list) => list.filter((item) => item.id !== moment.id));
          this.snackBar.open('Moment deleted successfully.', 'Close', { duration: 3000 });
          
          // Adjust current page if the deleted item was the only item on the last page
          const newTotalPages = Math.ceil(this.moments().length / this.pageSize());
          if (this.currentPage() > newTotalPages && this.currentPage() > 1) {
            this.currentPage.set(newTotalPages);
          }
        } catch (err) {
          console.error('Failed to delete moment', err);
          this.snackBar.open('Failed to delete moment.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}
