import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private apiUrl = 'http://127.0.0.1:8000/api/items/';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<Item> {
  const token = localStorage.getItem('auth_token');
  let headers = new HttpHeaders();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  return this.http.get<Item>(`${this.apiUrl}${id}/`, { headers });
}

  createItem(formData: FormData): Observable<any> {
    const token = localStorage.getItem('auth_token'); 
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(this.apiUrl, formData, { headers });
  }
  getMyItems(): Observable<any[]> {
    const token = localStorage.getItem('auth_token');
    return this.http.get<any[]>(`${this.apiUrl}my/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  addComment(itemId: number, text: string): Observable<any> {
    return this.http.post(`http://127.0.0.1:8000/api/comments/`, { 
      item: itemId, 
      text: text 
    });
  }
}