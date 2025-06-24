import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../shared/services/product.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  imports: [ReactiveFormsModule, CommonModule],
})
export class OverviewComponent implements OnInit {
  /* dashboard stats */
  totalProducts = 0;
  totalCustomers = 0;

  /* product-management state */
  products: any[] = [];
  productForm!: FormGroup;
  isEditMode = false;
  editingId: string | null = null;
  showProductForm = false;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private customerService: CustomerService
  ) {}

  /* ---------- life-cycle ---------- */
  ngOnInit(): void {
    this.initForm();
    this.loadDashboardStats();
    this.loadProducts();
  }

  /* ---------- dashboard cards ---------- */
  private loadDashboardStats() {
    this.productService
      .getAll()
      .subscribe((p) => (this.totalProducts = p.length));
    this.customerService
      .getAll()
      .subscribe((c) => (this.totalCustomers = c.length));
  }

  /* ---------- product CRUD ---------- */
  private initForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: [''],
      quantity: ['', Validators.required],
      image: [null],
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe((data) => (this.products = data));
  }

  onImageSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.productForm.patchValue({ image: file });
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const fd = new FormData();
    Object.entries(this.productForm.value).forEach(([k, v]) =>
      fd.append(k, v as any)
    );

    const req$ = this.isEditMode
      ? this.productService.update(this.editingId!, fd)
      : this.productService.create(fd);

    req$.subscribe(() => {
      this.resetForm();
      this.loadProducts();
    });
  }

  editProduct(p: any) {
    this.isEditMode = true;
    this.editingId = p.id;
    this.showProductForm = true;
    this.imagePreview = p.image || null;
    this.productForm.patchValue({
      name: p.name,
      price: p.price,
      description: p.description,
      quantity: p.quantity,
      image: null,
    });
  }

  deleteProduct(id: string) {
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  /* ---------- helpers ---------- */
  toggleProductForm() {
    this.showProductForm = !this.showProductForm;
    if (!this.showProductForm) this.resetForm();
  }

  hideProductForm() {
    this.showProductForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.productForm.reset();
    this.isEditMode = false;
    this.editingId = null;
    this.imagePreview = null;
  }
}
