import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(Auth);
  private sub!: Subscription;

  momentsExpanded = signal(true);
  userMenuExpanded = signal(false);
  sidebarOpen = signal(true); // default open on desktop
  pageTitle = signal('');
  userAvatarUrl = signal('/assets/images/user-avatar.jpg');

  async ngOnInit() {
    this.updateTitle(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.updateTitle((e as NavigationEnd).url));

    const uid = this.authService.getCurrentUserId();
    if (uid) {
      const profile = await this.authService.getUserProfile(uid);
      if (profile?.profilePic) {
        this.userAvatarUrl.set(profile.profilePic);
      }
    }
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

  toggleUserMenu() {
    this.userMenuExpanded.update((v) => !v);
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
