import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, HeaderComponent],
  template: `
    <div class="shell">
      <app-header />
      <main class="shell__content">
        <router-outlet />
      </main>
      <app-bottom-nav />
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }
    .shell__content {
      flex: 1;
      overflow-y: auto;
      padding-bottom: calc(60px + env(safe-area-inset-bottom));
    }
  `]
})
export class ShellComponent {}
