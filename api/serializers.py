from rest_framework import serializers
from admin_app.models import Category, Product, Size, Color, ProductSizeNColor, SubProduct
from app.models import User, Cart, stateModel, AddressModel, placeOrder, sub_placeorder

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category']

class ProductSizeNColorSerializer(serializers.ModelSerializer):
    size = serializers.CharField(source='size.name')
    color = serializers.CharField(source='color.name')
    
    class Meta:
        model = ProductSizeNColor
        fields = ['id', 'size', 'color', 'stock_quantity']

class SubProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_size_color = ProductSizeNColorSerializer(many=True, read_only=True)
    stock_quantity = serializers.IntegerField(source='get_stock_quantity', read_only=True)

    class Meta:
        model = SubProduct
        fields = ['id', 'product', 'description', 'image', 'product_size_color', 'stock_quantity']

from django.contrib.auth.models import User as DjangoUser

class UserSerializer(serializers.ModelSerializer):
    is_staff = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'user_name', 'user_email', 'is_staff']

    def get_is_staff(self, obj):
        try:
            dj_user = DjangoUser.objects.get(username=obj.user_name)
            return dj_user.is_staff or dj_user.is_superuser
        except DjangoUser.DoesNotExist:
            return False

class CartSerializer(serializers.ModelSerializer):
    subproduct = SubProductSerializer(read_only=True)
    subproduct_id = serializers.PrimaryKeyRelatedField(
        queryset=SubProduct.objects.all(), source='subproduct', write_only=True
    )
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'subproduct', 'subproduct_id', 'quantity', 'size', 'color', 'total_price']

    def get_total_price(self, obj):
        return obj.quantity * obj.subproduct.product.price

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = stateModel
        fields = ['id', 'state_name']

class AddressSerializer(serializers.ModelSerializer):
    state_id = serializers.PrimaryKeyRelatedField(
        queryset=stateModel.objects.all(), source='state', write_only=True
    )
    state = StateSerializer(read_only=True)

    class Meta:
        model = AddressModel
        fields = [
            'id', 'first_name', 'last_name', 'street_address', 
            'country', 'city', 'state', 'state_id', 
            'pincode', 'phone_number', 'email'
        ]

class SubPlaceOrderSerializer(serializers.ModelSerializer):
    subproduct = SubProductSerializer(source='subproduct_id', read_only=True)
    
    class Meta:
        model = sub_placeorder
        fields = ['id', 'subproduct', 'color', 'size', 'quantity', 'price']

class PlaceOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    address = AddressSerializer(source='address_id', read_only=True)

    class Meta:
        model = placeOrder
        fields = [
            'id', 'order_id', 'payment_mode', 'order_date', 
            'shipping_charge', 'total_quantity', 'total_amount', 
            'delivery_date', 'order_status', 'address', 'items'
        ]

    def get_items(self, obj):
        items = sub_placeorder.objects.filter(order_id=obj)
        return SubPlaceOrderSerializer(items, many=True).data
