from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Item, ItemImage, Claim, Comment, CustomUser

class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image']

class CommentSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
    itemId = serializers.ReadOnlyField(source='item.id')
    authorName = serializers.ReadOnlyField(source='author.username')
    createdAt = serializers.DateTimeField(source='created_at', format="%Y-%m-%dT%H:%M:%S", read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'item' ,'itemId', 'authorName', 'text', 'createdAt']

    def create(self, validated_data):
        return Comment.objects.create(**validated_data)

class ClaimDetailSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    student_id = serializers.ReadOnlyField(source='user.student_id')

    class Meta:
        model = Claim
        fields = ['id', 'username', 'student_id', 'description', 'status', 'created_at']

class ItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    type = serializers.CharField(source='item_type')
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d", read_only=True)
    #postedBy = serializers.ReadOnlyField(source='finder.username')
    postedBy = serializers.SerializerMethodField()
    def get_postedBy(self, obj):
        return obj.finder.username if obj.finder else "Unknown"
    category_name = serializers.ReadOnlyField(source='category.name')
    #category = serializers.ReadOnlyField(source='category.name')
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    finder = serializers.PrimaryKeyRelatedField(read_only=True)
    claims = ClaimDetailSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'category', 'category_name', 'location',
            'date', 'type', 'description', 'images', 
            'comments', 'uploaded_images', 'status', 'postedBy', 'finder', 'claims'
        ]
    def create(self, validated_data):
        images_data = validated_data.pop('uploaded_images', [])
        #user = self.context['request'].user
        item = Item.objects.create(**validated_data)
        if images_data:
            item.main_image = images_data[0]
            item.save()
        for image_data in images_data:
            ItemImage.objects.create(item=item, image=image_data)
        return item

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon']

class ClaimSerializer(serializers.ModelSerializer):
    itemId = serializers.PrimaryKeyRelatedField(source='item', queryset=Item.objects.all())
    date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d", read_only=True)
    title = serializers.ReadOnlyField(source='item.title')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Claim
        fields = ['id', 'itemId', 'user_email', 'title', 'description', 'status', 'date']

class StatsSerializer(serializers.Serializer):
    total_items = serializers.IntegerField()
    returned_items = serializers.IntegerField()

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'student_id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'student_id', 'password')

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            student_id=validated_data['student_id'],
            password=validated_data['password']
        )
        return user