import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../shared/services/customer.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  isLoading = true;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getAll().subscribe((res) => {
      this.customers = res;
      this.isLoading = false;
    });
  }
}
