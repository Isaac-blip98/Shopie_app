import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getAll() {
    return this.http.get<any[]>(this.baseUrl, this.getAuthHeaders());
  }

  create(product: any) {
    return this.http.post(this.baseUrl, product, this.getAuthHeaders());
  }

  update(id: string, product: any) {
    return this.http.put(`${this.baseUrl}/${id}`, product, this.getAuthHeaders());
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }
}
