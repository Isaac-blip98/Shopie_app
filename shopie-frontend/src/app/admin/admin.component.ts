import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin.component.html',
  imports: [CommonModule, RouterModule],
})
export class AdminDashboardComponent {
  logout() {
  localStorage.removeItem('access_token');
  window.location.href = '/auth/login';
}

}
