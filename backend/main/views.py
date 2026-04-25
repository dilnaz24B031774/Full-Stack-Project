from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Item, Category, Claim, Comment
from .serializers import ItemSerializer, StatsSerializer, CategorySerializer, ClaimSerializer, CommentSerializer, RegisterSerializer

@api_view(['GET'])
def get_stats(request):
    data = {
        'total_items': Item.objects.count(),
        'returned_items': Item.objects.filter(status='returned').count()
    }
    serializer = StatsSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
def recent_items(request):
    items = Item.objects.order_by('-created_at')[:3]
    serializer = ItemSerializer(items, many=True)
    return Response(serializer.data)


class ItemList(APIView):
    def get(self, request):
        items = Item.objects.all()
        search_query = request.query_params.get('search', None)
        if search_query:
            items = items.filter(title__icontains=search_query)
        category_id = request.query_params.get('category', None)
        if category_id:
            items = items.filter(category_id=category_id)
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(finder=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ItemDetail(APIView):
    def get_object(self, pk):
        try:
            return Item.objects.get(pk=pk)
        except Item.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item: return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ItemSerializer(item)
        return Response(serializer.data)
    def patch(self, request, pk):
        try:
            item = Item.objects.get(pk=pk)
        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ItemSerializer(item, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ItemCommentList(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        item_id = self.kwargs['item_id']
        return Comment.objects.filter(item_id=item_id)

class CommentCreate(generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
class ClaimList(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        claims = Claim.objects.filter(user=request.user)
        serializer = ClaimSerializer(claims, many=True)
        return Response(serializer.data)
    def post(self, request):
        serializer = ClaimSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ClaimDetail(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, pk):
        try:
            return Claim.objects.get(pk=pk)
        except Claim.DoesNotExist:
            return None

    def get(self, request, pk):
        claim = self.get_object(pk)
        if not claim: 
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClaimSerializer(claim)
        return Response(serializer.data)

    def patch(self, request, pk):
        claim = self.get_object(pk)
        if not claim: 
            return Response({"error": "Claim not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClaimSerializer(claim, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if request.data.get('status') == 'approved':
                try:
                    item = claim.item
                    item.status = 'returned'
                    item.save()
                    Claim.objects.filter(item=item).exclude(id=claim.id).update(status='rejected')
                except Exception as e:
                    print(f"Ошибка при обновлении статусов: {e}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        claim = self.get_object(pk)
        if not claim: 
            return Response(status=status.HTTP_404_NOT_FOUND)
        claim.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class RegisterView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class MyItemsView(generics.ListAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Item.objects.filter(finder=self.request.user).order_by('-created_at')
    def perform_create(self, serializer):
        serializer.save(finder=self.request.user)

class MyClaimsView(generics.ListAPIView):
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Claim.objects.filter(user=self.request.user).order_by('-created_at')
    
class ClaimsOnMyItemsView(generics.ListAPIView):
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Claim.objects.filter(item__finder=self.request.user).order_by('-created_at')