import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { User, Item } from '../../models/interfaces';
import { ItemService } from '../../services/item';
import { ClaimService } from '../../services/claim';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type ModalType = 'claims' | 'edit' | 'view-my-claim' | 'edit-my-claim';


@Component({
 selector: 'app-profile',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './profile.html',
 styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  showModal = false;
  modalType: ModalType = 'claims';
  currentImgIndex = 0;
  selectedItem: any = null;
  selectedClaims: any[] = [];
  enlargedImage: string | null = null;
  myClaims: Item[] = [];
  mySentRequests: any[] = [];
  myItems: any[] = [];
  claimsOnMyItems: any[] = [];

 constructor(private http: HttpClient, private authService: AuthService, private itemService: ItemService, private claimService: ClaimService, private cdr: ChangeDetectorRef) {}


 ngOnInit() {
   this.user = this.authService.getCurrentUser();
   console.log('Текущий юзер:', this.user);
   this.loadMyData();
 }
  loadMyData() {
    this.itemService.getMyItems().subscribe(items => {
      console.log('📦 Мои находки (Items) из БД:', items); 
      this.myItems = items; 
      this.cdr.detectChanges();
    });

    this.claimService.getMyClaims().subscribe(claims => {
      console.log('📝 Мои заявки (Claims) из БД:', claims); 
      this.mySentRequests = claims; 
      this.cdr.detectChanges();
    });
    this.claimService.getClaimsOnMyItems().subscribe({
      next: (data) => {
        this.claimsOnMyItems = data; 
        console.log('Заявки на мои вещи:', data);
      },
      error: (err) => console.error('Ошибка загрузки заявок:', err)
    });
  }

 openModal(item: any, type: ModalType) {
   this.selectedItem = { ...item };
   this.modalType = type;
   this.currentImgIndex = 0;
   this.showModal = true;
 }

 openImageFull(url: string) {
   this.enlargedImage = url;
 }

 closeImageFull() {
   this.enlargedImage = null;
 }

 closeModal() {
   this.showModal = false;
 }
 getFilteredClaims() {
    if (!this.selectedItem) return [];
    return this.claimsOnMyItems.filter(c => c.item === this.selectedItem.id);
  }

 approveClaim(claim: any) {
    if (confirm('Are you sure you want to approve this student?')) {
      this.claimService.updateClaimStatus(claim.id, 'approved').subscribe({
        next: () => {
          alert('Item marked as Returned!');
          this.loadMyData(); 
          this.showModal = false;
        },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  rejectClaim(claim: any) {
    this.claimService.updateClaimStatus(claim.id, 'rejected').subscribe({
      next: () => {
        alert('Claim rejected.');
        this.loadMyData();
      }
    });
  }
  getClaimsForItem(itemId: number | undefined) {
    if (!itemId || !this.claimsOnMyItems) return [];
    return this.claimsOnMyItems.filter((c: any) => c.itemId === itemId || c.item === itemId);
  }
  updateItem() {
    if (!this.selectedItem) return;
    this.http.patch(`http://127.0.0.1:8000/api/items/${this.selectedItem.id}/`, {
      title: this.selectedItem.title,
      description: this.selectedItem.description
    }).subscribe({
      next: (response) => {
        console.log('Item updated successfully', response);
        this.loadMyData();
        this.closeModal();
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Error updating item');
      }
    });
  }
}
