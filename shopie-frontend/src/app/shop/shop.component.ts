import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../shared/services/product.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  cartItems: any[] = [];
  
  searchTerm: string = '';
  sortBy: string = 'name';
  viewMode: 'grid' | 'list' = 'grid';
  isLoading: boolean = true;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCartItems();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.map(product => ({
          ...product,
          createdAt: product.createdAt || new Date()
        }));
        this.filteredProducts = [...this.products];
        this.onSort(); 
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;

        this.filteredProducts = [...this.products];
      }
    });
  }

  loadCartItems(): void {

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
    }
  }

  onSearch(): void {
    this.filterProducts();
  }

  onSort(): void {
    switch (this.sortBy) {
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        this.filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  filterProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    this.onSort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterProducts();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'name';
    this.filterProducts();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  trackByProduct(index: number, product: any): any {
    return product.id;
  }

  isNewProduct(product: any): boolean {

    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    return diffDays < 7;
  }

  getDescriptionPreview(description: string): string {
    if (!description) return '';
    return description.length > 80 ? description.slice(0, 80) + '...' : description;
  }

  addToCart(product: any): void {
    this.cartItems.push(product);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  viewProduct(product: any): void {
    this.router.navigate(['/shop/product', product.id]);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
  }

  viewCart(): void {
    this.router.navigate(['/cart']);
  }

  logout(): void {
    this.authService.logout?.(); 
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }
}