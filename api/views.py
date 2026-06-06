import datetime
import re
from django.contrib.auth.models import User as DjangoUser
from django.contrib.auth.hashers import check_password
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token

from admin_app.models import Category, Product, Size, Color, ProductSizeNColor, SubProduct
from app.models import User, Cart, stateModel, AddressModel, placeOrder, sub_placeorder, Contact
from app.utils import encode_id, decode_id  # Helper to encode/decode order IDs if needed
from api.serializers import (
    CategorySerializer, SubProductSerializer, UserSerializer, 
    CartSerializer, StateSerializer, AddressSerializer, PlaceOrderSerializer
)

# Helper function to get custom User associated with standard Django user
def get_custom_user(request):
    if not request.user or not request.user.is_authenticated:
        return None
    try:
        return User.objects.get(user_name=request.user.username)
    except User.DoesNotExist:
        # Auto-create if standard user exists but custom user does not (e.g. superuser / manual db creations)
        custom_user = User.objects.create(
            name=f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
            user_name=request.user.username,
            user_email=request.user.email
        )
        custom_user.save()
        return custom_user


# CATALOG APIS

class CategoryListAPI(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ProductListAPI(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        category_name = request.query_params.get('category', None)
        query = request.query_params.get('q', None)
        
        products = SubProduct.objects.all()
        
        if category_name:
            products = products.filter(product__category__name__iexact=category_name)
            
        if query:
            products = products.filter(product__name__icontains=query) | products.filter(description__icontains=query)
            
        serializer = SubProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductDetailAPI(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        product = get_object_or_404(SubProduct, pk=pk)
        serializer = SubProductSerializer(product)
        return Response(serializer.data)


# AUTHENTICATION APIS

class RegisterAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        name = request.data.get('name')
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not name or not username or not email or not password:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if ' ' in username:
            return Response({'error': 'Username cannot contain spaces.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not re.match(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_-]{8,}$', password):
            return Response({
                'error': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(user_name=username).exists() or DjangoUser.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(user_email=email).exists() or DjangoUser.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create Custom User
        custom_user = User.objects.create(name=name, user_name=username, user_email=email)
        custom_user.set_password(password)
        custom_user.save()
        
        # Create Django User for Auth
        django_user = DjangoUser.objects.create_user(username=username, email=email, password=password)
        django_user.first_name = name.split(' ')[0] if ' ' in name else name
        django_user.last_name = name.split(' ')[1] if ' ' in name else ''
        django_user.save()
        
        # Generate token
        token, _ = Token.objects.get_or_create(user=django_user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(custom_user).data
        }, status=status.HTTP_201_CREATED)


class LoginAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            custom_user = User.objects.get(user_name=username)
            if not check_password(password, custom_user.user_password):
                return Response({'error': 'Incorrect credentials.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            try:
                django_user = DjangoUser.objects.get(username=username)
                if django_user.check_password(password):
                    # Auto-create custom user
                    custom_user = User.objects.create(
                        name=f"{django_user.first_name} {django_user.last_name}".strip() or django_user.username,
                        user_name=django_user.username,
                        user_email=django_user.email
                    )
                    custom_user.set_password(password)
                    custom_user.save()
                else:
                    return Response({'error': 'Incorrect credentials.'}, status=status.HTTP_400_BAD_REQUEST)
            except DjangoUser.DoesNotExist:
                return Response({'error': 'Incorrect credentials.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Ensure standard Django user exists for Token Auth
        django_user, created = DjangoUser.objects.get_or_create(username=username, defaults={'email': custom_user.user_email})
        if created or not django_user.check_password(password):
            django_user.set_password(password)
            django_user.save()
            
        token, _ = Token.objects.get_or_create(user=django_user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(custom_user).data
        })


class UserDetailAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        custom_user = get_custom_user(request)
        serializer = UserSerializer(custom_user)
        return Response(serializer.data)


# CART APIS

class CartAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        custom_user = get_custom_user(request)
        cart_items = Cart.objects.filter(uname=custom_user)
        serializer = CartSerializer(cart_items, many=True)
        
        # Compute cart summary
        total_amount = sum([item.quantity * item.subproduct.product.price for item in cart_items])
        shipping_charge = 50 if total_amount > 0 else 0
        grand_total = total_amount + shipping_charge
        
        return Response({
            'items': serializer.data,
            'summary': {
                'total_amount': total_amount,
                'shipping_charge': shipping_charge,
                'grand_total': grand_total,
                'item_count': len(cart_items)
            }
        })
        
    def post(self, request):
        custom_user = get_custom_user(request)
        subproduct_id = request.data.get('subproduct_id')
        quantity = int(request.data.get('quantity', 1))
        size = request.data.get('size')
        color = request.data.get('color')
        
        if not subproduct_id or not size or not color:
            return Response({'error': 'Product ID, Size, and Color are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        subproduct = get_object_or_404(SubProduct, pk=subproduct_id)
        
        # Check stock
        stock_item = ProductSizeNColor.objects.filter(
            product=subproduct.product, size__name=size, color__name=color
        ).first()
        
        if not stock_item or stock_item.stock_quantity <= 0:
            return Response({'error': 'This item size/color combination is out of stock.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get or create cart item
        cart_item, created = Cart.objects.get_or_create(
            uname=custom_user, subproduct=subproduct, size=size, color=color,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            
        return Response(CartSerializer(cart_item).data, status=status.HTTP_201_CREATED)


class CartDetailAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, pk):
        custom_user = get_custom_user(request)
        cart_item = get_object_or_404(Cart, pk=pk, uname=custom_user)
        quantity = request.data.get('quantity')
        size = request.data.get('size')
        color = request.data.get('color')
        
        if quantity is not None:
            cart_item.quantity = int(quantity)
        if size is not None:
            cart_item.size = size
        if color is not None:
            cart_item.color = color
            
        # Verify stock if size or color updated
        stock_item = ProductSizeNColor.objects.filter(
            product=cart_item.subproduct.product, size__name=cart_item.size, color__name=cart_item.color
        ).first()
        
        if not stock_item or stock_item.stock_quantity < cart_item.quantity:
             return Response({'error': 'Requested quantity exceeds available stock.'}, status=status.HTTP_400_BAD_REQUEST)
             
        cart_item.save()
        return Response(CartSerializer(cart_item).data)
        
    def delete(self, request, pk):
        custom_user = get_custom_user(request)
        cart_item = get_object_or_404(Cart, pk=pk, uname=custom_user)
        cart_item.delete()
        return Response({'success': 'Item removed from cart.'})


# ADDRESS APIS

class StateListAPI(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        states = stateModel.objects.all()
        serializer = StateSerializer(states, many=True)
        return Response(serializer.data)


class AddressAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        custom_user = get_custom_user(request)
        address_obj = AddressModel.objects.filter(user_id=custom_user).first()
        if not address_obj:
            return Response({}, status=status.HTTP_200_OK)
        serializer = AddressSerializer(address_obj)
        return Response(serializer.data)
        
    def post(self, request):
        custom_user = get_custom_user(request)
        address_obj = AddressModel.objects.filter(user_id=custom_user).first()
        
        serializer = AddressSerializer(address_obj, data=request.data) if address_obj else AddressSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user_id=custom_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED if not address_obj else status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ORDER APIS

class PlaceOrderAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        custom_user = get_custom_user(request)
        address_obj = AddressModel.objects.filter(user_id=custom_user).first()
        
        if not address_obj:
            return Response({'error': 'Please provide a shipping address first.'}, status=status.HTTP_400_BAD_REQUEST)
            
        cart_items = Cart.objects.filter(uname=custom_user)
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
            
        total_cart_price = sum([item.quantity * item.subproduct.product.price for item in cart_items])
        shipping_charge = 50
        total_quantity = sum([item.quantity for item in cart_items])
        total_amount = total_cart_price + shipping_charge
        order_date = datetime.date.today()
        order_id = int(datetime.datetime.now().timestamp())
        payment_mode = request.data.get('payment_mode', 'COD')
        delivery_date = order_date + datetime.timedelta(days=7)
        
        # Create main order
        order = placeOrder.objects.create(
            user_id=custom_user,
            address_id=address_obj,
            order_date=order_date,
            payment_mode=payment_mode,
            delivery_date=delivery_date,
            shipping_charge=shipping_charge,
            total_quantity=total_quantity,
            total_amount=total_amount,
            order_id=order_id,
            order_status='Pending'
        )
        
        # Transfer cart items to order items and update stock
        for item in cart_items:
            size_color = item.subproduct.product_size_color.filter(size__name=item.size, color__name=item.color).first()
            if size_color:
                purchased_quantity = min(item.quantity, size_color.stock_quantity)
                if purchased_quantity > 0:
                    sub_order_item = sub_placeorder.objects.create(
                        order_id=order,
                        subproduct_id=item.subproduct,
                        size=item.size,
                        color=item.color,
                        quantity=purchased_quantity,
                        price=purchased_quantity * item.subproduct.product.price
                    )
                    sub_order_item.save()
                    
                    # Update inventory
                    size_color.stock_quantity = F('stock_quantity') - purchased_quantity
                    size_color.save()
                    
            item.delete()  # Remove item from cart
            
        # Send Order Email Confirmation (graceful fallback if SMTP fails)
        try:
            subject = 'The Unchanged - Order Confirmation'
            from_email = settings.DEFAULT_FROM_EMAIL or 'noreply@theunchanged.com'
            to_email = [custom_user.user_email]
            context = {
                'user': custom_user,
                'order_id': order_id,
                'total_amount': total_amount,
                'order_date': order_date,
                'items': sub_placeorder.objects.filter(order_id=order)
            }
            html_message = render_to_string('order_confirmation_email.html', context)
            plain_message = strip_tags(html_message)
            send_mail(subject, plain_message, from_email, to_email, html_message=html_message)
        except Exception as email_err:
            print("Email failed to send:", email_err)
            
        return Response(PlaceOrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderHistoryAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        custom_user = get_custom_user(request)
        orders = placeOrder.objects.filter(user_id=custom_user).order_id_hash_middleware_fields_sort() if hasattr(placeOrder.objects.filter(user_id=custom_user), 'order_id_hash_middleware_fields_sort') else placeOrder.objects.filter(user_id=custom_user).order_by('-order_date')
        
        # Fallback to standard sorting if custom middleware methods aren't active
        if not isinstance(orders, list):
            orders = orders.order_by('-order_date')
            
        serializer = PlaceOrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, order_id):
        custom_user = get_custom_user(request)
        order = get_object_or_404(placeOrder, order_id=order_id, user_id=custom_user)
        serializer = PlaceOrderSerializer(order)
        return Response(serializer.data)


class OrderCancelAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        custom_user = get_custom_user(request)
        order = get_object_or_404(placeOrder, order_id=order_id, user_id=custom_user)
        
        # Check order age (cancel allowed within 50 days based on legacy code)
        if (datetime.date.today() - order.order_date).days < 50:
            if order.order_status in ['Pending', 'Confirmed']:
                sub_orders = sub_placeorder.objects.filter(order_id=order)
                for item in sub_orders:
                    size_color = item.subproduct_id.product_size_color.filter(size__name=item.size, color__name=item.color).first()
                    if size_color:
                        size_color.stock_quantity = F('stock_quantity') + item.quantity
                        size_color.save()
                
                order.order_status = 'Cancelled'
                order.save()
                return Response(PlaceOrderSerializer(order).data)
            else:
                return Response({'error': f'Order cannot be cancelled because it is already {order.order_status}.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Cancellation window (50 days) has expired.'}, status=status.HTTP_400_BAD_REQUEST)


class OrderReturnAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, order_id):
        custom_user = get_custom_user(request)
        order = get_object_or_404(placeOrder, order_id=order_id, user_id=custom_user)
        
        if (datetime.date.today() - order.order_date).days < 50:
            if order.order_status == 'Delivered':
                sub_orders = sub_placeorder.objects.filter(order_id=order)
                for item in sub_orders:
                    size_color = item.subproduct_id.product_size_color.filter(size__name=item.size, color__name=item.color).first()
                    if size_color:
                        size_color.stock_quantity = F('stock_quantity') + item.quantity
                        size_color.save()
                
                order.order_status = 'Returned'
                order.save()
                return Response(PlaceOrderSerializer(order).data)
            else:
                return Response({'error': 'Only delivered orders can be returned.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Return window (50 days) has expired.'}, status=status.HTTP_400_BAD_REQUEST)

class ContactAPI(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        comments = request.data.get('comments') or request.data.get('Comments')
        
        if not name or not email or not subject or not comments:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        contact_obj = Contact.objects.create(name=name, email=email, subject=subject, Comments=comments)
        contact_obj.save()
        return Response({'success': 'Thank you! Your message has been received.'})


# ADMIN SERVICE APIS

from rest_framework.permissions import BasePermission

class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)


class AdminDashboardStatsAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        # 1. Total Revenue (exclude Cancelled)
        orders = placeOrder.objects.exclude(order_status='Cancelled')
        total_revenue = sum([o.total_amount for o in orders if o.total_amount])
        
        # 2. Counts
        total_orders_count = placeOrder.objects.count()
        total_products_count = SubProduct.objects.count()
        total_users_count = User.objects.count()
        
        # 3. Monthly Sales
        from collections import defaultdict
        sales_by_month = defaultdict(int)
        for order in orders:
            if order.order_date:
                month_str = order.order_date.strftime('%b %Y') # e.g. 'Jun 2026'
                sales_by_month[month_str] += order.total_amount or 0
                
        # Format monthly sales chronologically (python sort fallback)
        # We can extract date object to sort correctly
        sorted_sales = sorted(
            sales_by_month.items(),
            key=lambda x: datetime.datetime.strptime(x[0], '%b %Y') if x[0] else datetime.datetime.min
        )
        chart_data = [{'month': m, 'sales': amt} for m, amt in sorted_sales]
        
        # 4. Recent Orders
        recent_orders = placeOrder.objects.all().order_by('-order_id')[:5]
        recent_orders_data = PlaceOrderSerializer(recent_orders, many=True).data
        
        # 5. Recent Contacts
        recent_contacts = Contact.objects.all().order_by('-id')[:5]
        recent_contacts_data = [{
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'subject': c.subject,
            'comments': c.Comments,
            'created_at': c.created_at.strftime('%d %b %Y %I:%M %p')
        } for c in recent_contacts]
        
        return Response({
            'metrics': {
                'total_revenue': total_revenue,
                'total_orders': total_orders_count,
                'total_products': total_products_count,
                'total_users': total_users_count
            },
            'sales_chart': chart_data,
            'recent_orders': recent_orders_data,
            'recent_contacts': recent_contacts_data
        })


class AdminOrdersAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        orders = placeOrder.objects.all().order_by('-order_id')
        serializer = PlaceOrderSerializer(orders, many=True)
        return Response(serializer.data)


class AdminOrderDetailAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def patch(self, request, order_id):
        order = get_object_or_404(placeOrder, order_id=order_id)
        status_val = request.data.get('order_status')
        if status_val:
            old_status = order.order_status
            
            # Stock handling on state changes
            if status_val in ['Cancelled', 'Returned'] and old_status not in ['Cancelled', 'Returned']:
                sub_orders = sub_placeorder.objects.filter(order_id=order)
                for item in sub_orders:
                    size_color = item.subproduct_id.product_size_color.filter(size__name=item.size, color__name=item.color).first()
                    if size_color:
                        size_color.stock_quantity = F('stock_quantity') + item.quantity
                        size_color.save()
            elif old_status in ['Cancelled', 'Returned'] and status_val not in ['Cancelled', 'Returned']:
                sub_orders = sub_placeorder.objects.filter(order_id=order)
                for item in sub_orders:
                    size_color = item.subproduct_id.product_size_color.filter(size__name=item.size, color__name=item.color).first()
                    if size_color:
                        size_color.stock_quantity = F('stock_quantity') - item.quantity
                        size_color.save()
                        
            order.order_status = status_val
            
            # Auto update delivery date if status marked delivered
            if status_val == 'Delivered' and not order.delivery_date:
                order.delivery_date = datetime.date.today()
                
            order.save()
            
        return Response(PlaceOrderSerializer(order).data)


class AdminUsersAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        users = User.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminContactsAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        contacts = Contact.objects.all().order_by('-id')
        data = [{
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'subject': c.subject,
            'comments': c.Comments,
            'created_at': c.created_at.strftime('%d %b %Y %I:%M %p')
        } for c in contacts]
        return Response(data)


class AdminProductsAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        products = SubProduct.objects.all().order_by('-id')
        serializer = SubProductSerializer(products, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        name = request.data.get('name')
        price = request.data.get('price')
        category_id = request.data.get('category_id')
        description = request.data.get('description')
        image_file = request.FILES.get('image')
        attributes_str = request.data.get('attributes', '[]')
        
        if not name or not price or not category_id or not description:
            return Response({'error': 'Name, price, category, and description are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        product = Product.objects.create(name=name, price=int(price), category=category)
        
        image_path = ''
        if image_file:
            import os
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            saved_name = default_storage.save(
                os.path.join('images', 'products', image_file.name),
                ContentFile(image_file.read())
            )
            image_path = saved_name
            
        subproduct = SubProduct.objects.create(product=product, description=description, image=image_path)
        
        # Attributes deserialization (Size / Color / Stock)
        import json
        try:
            attributes = json.loads(attributes_str)
            for attr in attributes:
                size_name = attr.get('size')
                color_name = attr.get('color')
                stock_qty = int(attr.get('stock', 0))
                
                if size_name and color_name:
                    size, _ = Size.objects.get_or_create(name=size_name)
                    color, _ = Color.objects.get_or_create(name=color_name)
                    
                    psc, _ = ProductSizeNColor.objects.get_or_create(
                        product=product,
                        size=size,
                        color=color,
                        defaults={'stock_quantity': stock_qty}
                    )
                    if not _:
                        psc.stock_quantity = stock_qty
                        psc.save()
                    subproduct.product_size_color.add(psc)
        except Exception as e:
            print("Error processing attributes:", e)
            
        return Response(SubProductSerializer(subproduct).data, status=status.HTTP_201_CREATED)


class AdminProductDetailAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def put(self, request, pk):
        subproduct = get_object_or_404(SubProduct, pk=pk)
        product = subproduct.product
        
        name = request.data.get('name')
        price = request.data.get('price')
        category_id = request.data.get('category_id')
        description = request.data.get('description')
        image_file = request.FILES.get('image')
        attributes_str = request.data.get('attributes')
        
        if name:
            product.name = name
        if price:
            product.price = int(price)
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
                product.category = category
            except Category.DoesNotExist:
                return Response({'error': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.save()
        
        if description:
            subproduct.description = description
            
        if image_file:
            import os
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            saved_name = default_storage.save(
                os.path.join('images', 'products', image_file.name),
                ContentFile(image_file.read())
            )
            subproduct.image = saved_name
            
        subproduct.save()
        
        if attributes_str:
            import json
            try:
                attributes = json.loads(attributes_str)
                # Clear legacy M2M relations and rebuild them
                subproduct.product_size_color.clear()
                for attr in attributes:
                    size_name = attr.get('size')
                    color_name = attr.get('color')
                    stock_qty = int(attr.get('stock', 0))
                    
                    if size_name and color_name:
                        size, _ = Size.objects.get_or_create(name=size_name)
                        color, _ = Color.objects.get_or_create(name=color_name)
                        
                        psc, _ = ProductSizeNColor.objects.get_or_create(
                            product=product,
                            size=size,
                            color=color,
                            defaults={'stock_quantity': stock_qty}
                        )
                        psc.stock_quantity = stock_qty
                        psc.save()
                        subproduct.product_size_color.add(psc)
            except Exception as e:
                print("Error updating attributes:", e)
                
        return Response(SubProductSerializer(subproduct).data)
        
    def delete(self, request, pk):
        subproduct = get_object_or_404(SubProduct, pk=pk)
        product = subproduct.product
        subproduct.delete()
        product.delete()
        return Response({'success': 'Product deleted successfully.'})


class AdminAttributesAPI(APIView):
    permission_classes = [IsStaffUser]
    
    def get(self, request):
        categories = Category.objects.all()
        colors = Color.objects.all()
        sizes = Size.objects.all()
        
        return Response({
            'categories': [{'id': c.id, 'name': c.name} for c in categories],
            'colors': [{'id': c.id, 'name': c.name} for c in colors],
            'sizes': [{'id': c.id, 'name': c.name} for c in sizes],
        })
        
    def post(self, request):
        attr_type = request.data.get('type')
        name = request.data.get('name')
        
        if not attr_type or not name:
            return Response({'error': 'Type and Name are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if attr_type == 'category':
            obj, created = Category.objects.get_or_create(name=name)
        elif attr_type == 'color':
            obj, created = Color.objects.get_or_create(name=name)
        elif attr_type == 'size':
            obj, created = Size.objects.get_or_create(name=name)
        else:
            return Response({'error': 'Invalid attribute type.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'id': obj.id, 'name': obj.name, 'created': created})

