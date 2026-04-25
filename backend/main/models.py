from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    student_id = models.CharField(max_length=20, unique=True, verbose_name="Student ID")
    email = models.EmailField(unique=True) 

    REQUIRED_FIELDS = ['student_id', 'email'] 

    def __str__(self):
        return self.username

class AvailableItemsManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status='available')

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='help_outline')

    def __str__(self):
        return self.name

class Item(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('under_review', 'Under Review'),
        ('returned', 'Returned'),
    ]
    TYPE_CHOICES = [
        ('Lost', 'Lost'),
        ('Found', 'Found'),
    ]
    objects = models.Manager() 
    available = AvailableItemsManager()
    title = models.CharField(max_length=255)
    description = models.TextField()
    main_image = models.ImageField(upload_to='items/main/', blank=True, null=True)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    item_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='Found')
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    finder = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    def __str__(self):
        return f"[{self.item_type}] {self.title}"
    
class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/gallery/')
    def __str__(self):
        return f"Image for {self.item.title}"

class Claim(models.Model):
    CLAIM_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    description = models.TextField() 
    status = models.CharField(max_length=20, choices=CLAIM_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claims')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    def __str__(self):
        return f"Claim by {self.user.username} for {self.item.title}"
    
class Comment(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Comment by {self.author.username} on {self.item.title}"
    
