import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    quantity: number; 
  };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = 'http://localhost:3000/cart';

  private _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly   items$   = this._items$.asObservable();
  readonly   count$   = this.items$.pipe(map((it) => it.length));
  readonly   subtotal$ = this.items$.pipe(
    map((it) =>
      it.reduce((s, line) => s + Number(line.product.price) * line.quantity, 0),
    ),
  );

  constructor(private http: HttpClient) {

    this.refresh().subscribe();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.refresh(); 
  }

  addToCart(productId: string, quantity = 1): Observable<CartItem> {
    return this.http
      .post<CartItem>(this.api, { productId, quantity })
      .pipe(switchMap(() => this.refreshSingle(productId)));
  }

  updateCartItem(itemId: string, quantity: number): Observable<CartItem> {
    return this.http
      .patch<CartItem>(`${this.api}/${itemId}`, { quantity })
      .pipe(switchMap(() => this.refreshByItemId(itemId)));
  }

  removeItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${itemId}`).pipe(
      tap(() => {

        this._items$.next(this._items$.value.filter((it) => it.id !== itemId));
      }),
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.api).pipe(
      tap(() => this._items$.next([])),
    );
  }

  getSubtotal(): number {
    return this._items$.value.reduce(
      (s, it) => s + Number(it.product.price) * it.quantity,
      0,
    );
  }
  getCount(): number {
    return this._items$.value.length;
  }

  private refresh(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.api).pipe(
      tap((items) => this._items$.next(items)),
    );
  }

  private refreshSingle(productId: string): Observable<CartItem> {
    return this.refresh().pipe(
      map((items) => items.find((i) => i.product.id === productId)!),
    );
  }

  private refreshByItemId(itemId: string): Observable<CartItem> {
    return this.refresh().pipe(
      map((items) => items.find((i) => i.id === itemId)!),
    );
  }
}
