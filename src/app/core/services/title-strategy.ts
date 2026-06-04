import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, TitleStrategy, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private titleService = inject(Title);

  override buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    const appName = 'BuildMoments';
    if (!snapshot?.root) return appName;

    const title = this.getTitleFromRoute(snapshot.root);
    return title ? `${appName} - ${title}` : appName;
  }

  private getTitleFromRoute(snapshot: ActivatedRouteSnapshot): string | null {
    // Get title from current route data
    let title = snapshot.data['title'];

    // If no title, check child routes
    if (!title && snapshot.firstChild) {
      title = this.getTitleFromRoute(snapshot.firstChild);
    }

    return title || null;
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    this.titleService.setTitle(title || 'BuildMoments');
  }
}
