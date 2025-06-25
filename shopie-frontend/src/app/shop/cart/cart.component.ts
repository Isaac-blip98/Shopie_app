import { Component, OnInit } from '@angular/core';
import { CartItem, CartService } from '../../../shared/services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;

  constructor(private cartService: CartService,     private router: Router,      ) {}

  ngOnInit(): void {
    this.fetchCart();
  }

  fetchCart() {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId).subscribe(() => {
      this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
    });
  }

  updateQuantity(itemId: string, newQty: number) {
    this.cartService.updateCartItem(itemId, newQty).subscribe(() => {
      this.fetchCart();
    });
  }
closeCart(): void {
  this.router.navigate(['/shop']);
}
}
