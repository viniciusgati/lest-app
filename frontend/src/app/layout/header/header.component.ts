import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar>
      <div class="p-toolbar-group-start">
        <span class="font-bold text-lg">{{ pageTitle() }}</span>
      </div>
      <div class="p-toolbar-group-end">
        <p-button
          icon="pi pi-sign-out"
          [text]="true"
          severity="secondary"
          (onClick)="logout()"
          pTooltip="Sair"
        />
      </div>
    </p-toolbar>
  `
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  private readonly routeTitles: Record<string, string> = {
    '/': 'EduTrack',
    '/subjects': 'Matérias',
    '/agenda': 'Agenda',
    '/goals': 'Metas'
  };

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  pageTitle = computed(() => this.routeTitles[this.currentUrl()] ?? 'EduTrack');

  logout(): void {
    this.auth.logout().subscribe();
  }
}
