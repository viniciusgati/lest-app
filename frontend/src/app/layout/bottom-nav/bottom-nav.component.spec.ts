import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BottomNavComponent } from './bottom-nav.component';
import { provideRouter, Router } from '@angular/router';

@Component({ standalone: true, template: '' })
class StubComponent {}

const testRoutes = [
  { path: '', component: StubComponent },
  { path: 'subjects', component: StubComponent },
  { path: 'agenda', component: StubComponent },
  { path: 'goals', component: StubComponent },
];

describe('BottomNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter(testRoutes)]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render 4 nav items', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.bottom-nav__item').length).toBe(4);
  });

  it('should have nav items with labels Home, Matérias, Agenda, Metas', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const spans = Array.from(compiled.querySelectorAll('.bottom-nav__item span')).map(
      el => el.textContent?.trim()
    );
    expect(spans).toEqual(['Home', 'Matérias', 'Agenda', 'Metas']);
  });

  it('should apply active class to the current route item', async () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/subjects');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const activeItems = compiled.querySelectorAll('.bottom-nav__item--active');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].getAttribute('href')).toBe('/subjects');
  });

  it('navItems should contain correct routes', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    const routes = fixture.componentInstance.navItems.map(i => i.route);
    expect(routes).toEqual(['/', '/subjects', '/agenda', '/goals']);
  });
});
