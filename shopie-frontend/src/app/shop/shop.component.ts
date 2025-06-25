import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../shared/services/product.service';
import { AuthService }    from '../../shared/services/auth.service';
import { CartService }    from '../../shared/services/cart.service';

import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
})
export class ShopComponent implements OnInit {
  userName    = 'Customer';
  userInitial = 'C';

  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm = '';
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest' = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = true;

  cart$!: Observable<{ count: number; total: number }>;

  constructor(
    private productService: ProductService,
    private authService:    AuthService,
    private cart:           CartService,
    private router:         Router,
  ) {

    this.cart$ = combineLatest([this.cart.count$, this.cart.subtotal$]).pipe(
      map(([count, total]) => ({ count, total })),
    );
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser?.();
    if (user?.name) {
      this.userName   = user.name;
      this.userInitial = user.name[0]?.toUpperCase() ?? 'C';
    }
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.map((p: any) => ({
          ...p,
          createdAt: p.createdAt || new Date(),
        }));
        this.filteredProducts = [...this.products];
        this.onSort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
    });
  }

  isNewProduct = (p: any) =>
    (Date.now() - new Date(p.createdAt).getTime()) / 8.64e7 < 7; 
  isOut       = (p: any) => p.quantity === 0;
  trackByProduct = (_: number, p: any) => p.id;
  getDescriptionPreview = (d = '') => (d.length > 80 ? d.slice(0, 80) + '…' : d);
  setViewMode = (m: 'grid' | 'list') => (this.viewMode = m);

  onSearch()       { this.filterProducts(); }
  clearSearch()    { this.searchTerm = ''; this.filterProducts(); }
  clearAllFilters(){ this.searchTerm = ''; this.sortBy = 'name'; this.filterProducts(); }

  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredProducts = term
      ? this.products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term),
        )
      : [...this.products];
    this.onSort();
  }

  onSort(): void {
    const sortFn: Record<string, (a: any, b: any) => number> = {
      name:        (a, b) => a.name.localeCompare(b.name),
      'price-low':  (a, b) => +a.price - +b.price,
      'price-high': (a, b) => +b.price - +a.price,
      newest:      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    };
    this.filteredProducts.sort(sortFn[this.sortBy]);
  }

  addToCart(product: any) {
    if (this.isOut(product)) return;
    this.cart.addToCart(product.id).subscribe();
  }
  viewCart() { this.router.navigate(['/cart']); }

  viewProduct(p: any) { this.router.navigate(['/shop/product', p.id]); }
  logout() {
    this.authService.logout?.();
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }
}
