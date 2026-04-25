import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Claim, Comment, Item } from '../../models/interfaces';
import { ItemService } from '../../services/item';
import { ClaimService } from '../../services/claim';
import { AuthService } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-item-detail',
  standalone: true,
  templateUrl: './item-detail.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./item-detail.css']
})
export class ItemDetailComponent implements OnInit {
  selectedItem: any
  isMyPost: boolean = false;
  alreadyClaimed: boolean = false;
  currentIndex: number = 0;
  item: any;
  claimDescription: string = ''; 
  newClaim: Partial<Claim> = { description: '' };
  comments: Comment[] = [];
  newCommentText: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private claimService: ClaimService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {}

  ngOnInit() {
    const idFromUrl = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID из URL:', idFromUrl);
    if (idFromUrl) {
      this.itemService.getItems().subscribe({
        next: (allData: any[]) => {
          console.log('Все данные с сервера:', allData);
          this.selectedItem = allData.find(i => Number(i.id) === idFromUrl);
          if (this.selectedItem) {
            console.log('Предмет найден!', this.selectedItem);
            const currentUsername = localStorage.getItem('username');
            this.isMyPost = (this.selectedItem.postedBy === currentUsername);
            if (!this.selectedItem.images) {
              this.selectedItem.images = [];
            }
          } else {
            console.warn('Предмет с таким ID не найден в списке');
          }
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Ошибка загрузки данных:', err)
      });
    }
  }

  nextImage() {
    if (this.selectedItem?.images && this.selectedItem.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.selectedItem.images.length;
    }
  }

  prevImage() {
    if (this.selectedItem?.images && this.selectedItem.images.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.selectedItem.images.length) % this.selectedItem.images.length;
    }
  }

  goBack() { this.location.back(); }

  submitClaim() {
    console.log("Кнопка нажата!");
    const itemIdFromUrl = Number(this.route.snapshot.params['id']);
    if (!this.claimDescription || this.claimDescription.trim() === '') {
      alert('Please describe why this item is yours');
      return;
    }
    console.log("Отправка заявки для ID:", itemIdFromUrl);
    this.claimService.createClaim(itemIdFromUrl, this.claimDescription).subscribe({
      next: (res) => {
        alert('Claim sent successfully!');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Ошибка API:', err);
        alert('Ошибка! Проверь консоль (Network tab)');
      }
    });
  }

  postComment() {
    if (!this.newCommentText.trim() || !this.selectedItem) return;

    const textToSend = this.newCommentText;
    this.newCommentText = '';
    this.itemService.addComment(this.selectedItem.id, textToSend).subscribe({
      next: (comment) => {
        const updatedComments = this.selectedItem!.comments ? [...this.selectedItem!.comments] : [];
        updatedComments.push(comment);
        this.selectedItem = {
          ...this.selectedItem!,
          comments: updatedComments
        };
        console.log('Сообщение улетело в чат!', comment);
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Ошибка:', err);
        this.newCommentText = textToSend; 
      }
    });
  }
  scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.querySelector('.comments-list');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }
}
