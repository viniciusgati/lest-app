import { TestBed } from '@angular/core/testing';
import { BottomNavComponent } from './bottom-nav.component';
import { provideRouter } from '@angular/router';

describe('BottomNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([])]
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
    const items = compiled.querySelectorAll('.bottom-nav__item');
    expect(items.length).toBe(4);
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

  it('should have routerLinkActive configured on items', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('a.bottom-nav__item');
    expect(items.length).toBe(4);
  });

  it('navItems should contain correct routes', () => {
    const fixture = TestBed.createComponent(BottomNavComponent);
    const component = fixture.componentInstance;
    const routes = component.navItems.map(i => i.route);
    expect(routes).toEqual(['/', '/subjects', '/agenda', '/goals']);
  });
});
