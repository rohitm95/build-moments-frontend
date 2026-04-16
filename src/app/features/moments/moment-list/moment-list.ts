import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface Moment {
  id: number;
  imageUrl: string;
  title: string;
  tags: string[];
}

const ALL_MOMENTS: Moment[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  imageUrl: `https://i.pravatar.cc/40?u=moment${i + 1}`,
  title: 'Sample title 1',
  tags: ['tag 1'],
}));

@Component({
  selector: 'app-moment-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './moment-list.html',
  styleUrl: './moment-list.scss',
})
export class MomentList {
  readonly pageSizeOptions = [7, 10, 15, 25];
  pageSize = signal(7);
  currentPage = signal(1);

  readonly totalItems = ALL_MOMENTS.length;

  readonly totalPages = computed(() => Math.ceil(this.totalItems / this.pageSize()));

  readonly pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return ALL_MOMENTS.slice(start, start + this.pageSize());
  });

  readonly rangeLabel = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.totalItems);
    return `${start}-${end} Of ${this.totalItems}`;
  });

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

  removeTag(moment: Moment, tag: string) {
    moment.tags = moment.tags.filter((t) => t !== tag);
    // trigger change detection
    this.currentPage.update((p) => p);
  }

  onEdit(moment: Moment) {
    console.log('Edit moment:', moment.id);
  }

  onDelete(moment: Moment) {
    console.log('Delete moment:', moment.id);
  }
}
