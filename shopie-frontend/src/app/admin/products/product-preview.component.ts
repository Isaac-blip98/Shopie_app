import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../shared/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-product-preview',
  templateUrl: './product-preview.component.html',
})
export class ProductPreviewComponent implements OnInit {
  products: any[] = [];
  isLoading = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAll().subscribe((res) => {
      this.products = res;
      this.isLoading = false;
    });
  }

  trackByProduct(index: number, product: any): string {
    return product.id;
  }
}
