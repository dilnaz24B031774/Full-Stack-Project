import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim,Comment } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private apiUrl = 'http://127.0.0.1:8000/api/claims/'; 

  constructor(private http: HttpClient) {}

  createClaim(itemId: number, description: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    
    const body = { 
      itemId: itemId, 
      description: description 
    };

    return this.http.post<any>(this.apiUrl.replace(/\/$/, '') + '/', body, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  getMyClaims(): Observable<any[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<any[]>(`${this.apiUrl}my/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  getClaimsOnMyItems(): Observable<any[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<any[]>(`${this.apiUrl}on-my-items/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  updateClaimStatus(claimId: number, status: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    return this.http.patch(`${this.apiUrl}${claimId}/`, { status: status }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
