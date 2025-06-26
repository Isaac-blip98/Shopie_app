import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-landing',
  standalone : true,
  imports    : [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {

  products: any[]         = [];
  filtered: any[]         = [];
  isLoading               = true;


  term     = '';
  minPrice?: number;
  maxPrice?: number;
  
  today = new Date();


  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next : (data) => { this.products = data; this.applyFilters(); },
      error: (e)    => { console.error(e); },
      complete: ()  => (this.isLoading = false),
    });
  }


  applyFilters(): void {
    const t = this.term.toLowerCase().trim();

    this.filtered = this.products.filter((p) => {
      const matchesText =
        !t ||
        p.name.toLowerCase().includes(t) ||
        p.description?.toLowerCase().includes(t);

      const matchesMin = this.minPrice == null || +p.price >= this.minPrice;
      const matchesMax = this.maxPrice == null || +p.price <= this.maxPrice;

      return matchesText && matchesMin && matchesMax;
    });
  }

  clearAll() {
    this.term = '';
    this.minPrice = this.maxPrice = undefined;
    this.applyFilters();
  }


  goLogin    = () => this.router.navigate(['/auth/login']);
  goRegister = () => this.router.navigate(['/auth/register']);

  imgFallback(e: Event) {
    (e.target as HTMLImageElement).src =
      'https://placehold.co/300x200?text=No+Image';
  }
}
