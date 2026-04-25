from django.contrib import admin
from .models import CustomUser, Category, Item, Claim, Comment, ItemImage

class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 3

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    inlines = [ItemImageInline, CommentInline]
    list_display = ('title', 'item_type', 'status', 'category', 'created_at')
    list_filter = ('item_type', 'status', 'category')
    search_fields = ('title', 'description')

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('description',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'icon')

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'student_id', 'email', 'is_staff')
    search_fields = ('username', 'student_id', 'email')

admin.site.register(Comment)