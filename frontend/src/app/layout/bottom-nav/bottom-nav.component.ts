import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      @for (item of navItems; track item.route) {
        <a
          class="bottom-nav__item"
          [routerLink]="item.route"
          routerLinkActive="bottom-nav__item--active"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
        >
          <i class="pi {{ item.icon }}"></i>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      background: var(--surface-card);
      border-top: 1px solid var(--surface-border);
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 1000;
    }
    .bottom-nav__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      color: var(--text-color-secondary);
      text-decoration: none;
      font-size: 0.65rem;
      transition: color 0.2s;
    }
    .bottom-nav__item i {
      font-size: 1.2rem;
    }
    .bottom-nav__item--active {
      color: var(--primary-color);
    }
  `]
})
export class BottomNavComponent {
  navItems: NavItem[] = [
    { label: 'Home', icon: 'pi-home', route: '/' },
    { label: 'Matérias', icon: 'pi-book', route: '/subjects' },
    { label: 'Agenda', icon: 'pi-calendar', route: '/agenda' },
    { label: 'Metas', icon: 'pi-flag', route: '/goals' }
  ];
}
