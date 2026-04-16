import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit, OnDestroy {
  private router = inject(Router);
  private sub!: Subscription;

  momentsExpanded = signal(true);
  pageTitle = signal('');

  ngOnInit() {
    this.updateTitle(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.updateTitle((e as NavigationEnd).url));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateTitle(url: string) {
    if (url.includes('/moments/add')) this.pageTitle.set('Add new moment');
    else if (url.includes('/moments')) this.pageTitle.set('Moments');
    else if (url.includes('/profile')) this.pageTitle.set('Profile');
    else this.pageTitle.set('');
  }

  toggleMoments() {
    this.momentsExpanded.update((v) => !v);
  }
}
