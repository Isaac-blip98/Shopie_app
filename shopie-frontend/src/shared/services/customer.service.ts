import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private api = 'http://localhost:3000/users'; // adjust

  constructor(private http: HttpClient) {}

  /** returns only CUSTOMER role users */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}?role=CUSTOMER`);
  }
}
