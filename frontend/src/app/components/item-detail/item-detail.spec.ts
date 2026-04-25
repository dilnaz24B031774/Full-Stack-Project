import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailComponent } from './item-detail';

describe('ItemDetail', () => {
  let component: ItemDetailComponent;
  let fixture: ComponentFixture<ItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
