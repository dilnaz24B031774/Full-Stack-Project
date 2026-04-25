from django.urls import path
from .views import ClaimsOnMyItemsView, ItemList, ItemDetail, MyClaimsView, MyItemsView, get_stats, recent_items, CategoryList, ClaimList, ClaimDetail, ItemCommentList, CommentCreate, RegisterView

urlpatterns = [
    path('items/', ItemList.as_view(), name='item-list'),
    path('items/<int:pk>/', ItemDetail.as_view(), name='item-detail'),
    path('items/<int:item_id>/comments/', ItemCommentList.as_view(), name='item-comments'),
    path('comments/', CommentCreate.as_view(), name='comment-create'),
    path('recent/', recent_items, name='api-recent'), 
    path('categories/', CategoryList.as_view(), name='category-list'), 
    path('stats/', get_stats, name='api-stats'),  
    path('claims/', ClaimList.as_view(), name='claim-list'),
    path('claims/<int:pk>/', ClaimDetail.as_view(), name='claim-detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('items/my/', MyItemsView.as_view(), name='my-items'),
    path('claims/my/', MyClaimsView.as_view(), name='my-claims'),
    path('claims/on-my-items/', ClaimsOnMyItemsView.as_view(), name='claims-on-my-items'),
]

