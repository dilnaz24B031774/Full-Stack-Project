import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostItemComponent } from './post-item';

describe('PostItem', () => {
  let component: PostItemComponent;
  let fixture: ComponentFixture<PostItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



