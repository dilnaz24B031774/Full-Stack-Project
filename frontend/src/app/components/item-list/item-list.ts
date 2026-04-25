import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemService } from '../../services/item';
import { Item } from '../../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.css']
})
export class ItemListComponent implements OnInit {

  allItems: any[] = []; 
  items: any[] = [];

  constructor(
    private itemService: ItemService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.itemService.getItems().subscribe({
      next: (data) => {
        console.log('Данные из БД получены:', data);
        this.allItems = data;
        this.items = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Ошибка при получении данных из БД:', err);
      }
    });
  }
  
  applyFilters(search: string, type: string, categoryId: string) {
    this.items = this.allItems.filter(item => {
      const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
      const matchesType = !type || item.type?.toLowerCase() === type.toLowerCase();
      const matchesCategory = !categoryId || item.category?.toString() === categoryId;
      return matchesSearch && matchesType && matchesCategory;
    });
    console.log('Поиск по тексту:', search);
    console.log('Найдено:', this.items.length);
  }

  viewItemDetails(id: number | undefined) {
    if (id) {
      this.router.navigate(['/item', id]);
    }
  }

  resetFilters() {
    this.items = [...this.allItems];
  }
}