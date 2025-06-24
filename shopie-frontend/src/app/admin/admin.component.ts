import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../shared/services/product.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgFor],
})
export class AdminDashboardComponent implements OnInit {
  products: any[] = [];
  customers: any[] = []; 
  productForm: FormGroup;
  isEditMode = false;
  editingProductId: string | null = null;
  showProductForm = false;

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe((data) => {
      this.products = data;
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    console.log('Submitting:', this.productForm.value); 

    if (this.isEditMode) {
      this.productService
        .update(this.editingProductId!, this.productForm.value)
        .subscribe(() => {
          this.resetForm();
          this.loadProducts();
        });
    } else {
      this.productService.create(this.productForm.value).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    }
  }

  editProduct(product: any) {
    this.isEditMode = true;
    this.editingProductId = product.id;
    this.productForm.patchValue(product);
  }

  deleteProduct(id: string) {
    this.productService.delete(id).subscribe(() => {
      this.loadProducts();
    });
  }

  resetForm() {
    this.productForm.reset();
    this.isEditMode = false;
    this.editingProductId = null;
  }

  toggleProductForm() {
    this.showProductForm = !this.showProductForm;
    if (this.showProductForm && !this.isEditMode) {
      this.resetForm();
    }
    if (!this.showProductForm) this.resetForm();
  }

  hideProductForm() {
    this.showProductForm = false;
    this.resetForm();
  }

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/auth/login';
  }

  trackByProduct(index: number, product: any) {
    return product.id;
  }
}
