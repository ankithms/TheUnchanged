from django.urls import path
from api.views import (
    CategoryListAPI, ProductListAPI, ProductDetailAPI,
    RegisterAPI, LoginAPI, UserDetailAPI,
    CartAPI, CartDetailAPI, StateListAPI, AddressAPI,
    PlaceOrderAPI, OrderHistoryAPI, OrderDetailAPI, OrderCancelAPI, OrderReturnAPI, ContactAPI,
    AdminDashboardStatsAPI, AdminOrdersAPI, AdminOrderDetailAPI, AdminUsersAPI,
    AdminContactsAPI, AdminProductsAPI, AdminProductDetailAPI, AdminAttributesAPI
)

urlpatterns = [
    # Catalog
    path('categories/', CategoryListAPI.as_view(), name='api_categories'),
    path('products/', ProductListAPI.as_view(), name='api_products'),
    path('products/<int:pk>/', ProductDetailAPI.as_view(), name='api_product_detail'),
    path('states/', StateListAPI.as_view(), name='api_states'),
    path('contact/', ContactAPI.as_view(), name='api_contact'),

    # Auth
    path('auth/register/', RegisterAPI.as_view(), name='api_register'),
    path('auth/login/', LoginAPI.as_view(), name='api_login'),
    path('auth/user/', UserDetailAPI.as_view(), name='api_user_detail'),

    # Cart
    path('cart/', CartAPI.as_view(), name='api_cart'),
    path('cart/<int:pk>/', CartDetailAPI.as_view(), name='api_cart_detail'),

    # Address
    path('address/', AddressAPI.as_view(), name='api_address'),

    # Orders
    path('orders/place/', PlaceOrderAPI.as_view(), name='api_place_order'),
    path('orders/', OrderHistoryAPI.as_view(), name='api_orders'),
    path('orders/<int:order_id>/', OrderDetailAPI.as_view(), name='api_order_detail'),
    path('orders/<int:order_id>/cancel/', OrderCancelAPI.as_view(), name='api_order_cancel'),
    path('orders/<int:order_id>/return/', OrderReturnAPI.as_view(), name='api_order_return'),

    # Admin Panel APIs
    path('admin/stats/', AdminDashboardStatsAPI.as_view(), name='api_admin_stats'),
    path('admin/orders/', AdminOrdersAPI.as_view(), name='api_admin_orders'),
    path('admin/orders/<int:order_id>/', AdminOrderDetailAPI.as_view(), name='api_admin_order_detail'),
    path('admin/users/', AdminUsersAPI.as_view(), name='api_admin_users'),
    path('admin/contacts/', AdminContactsAPI.as_view(), name='api_admin_contacts'),
    path('admin/products/', AdminProductsAPI.as_view(), name='api_admin_products'),
    path('admin/products/<int:pk>/', AdminProductDetailAPI.as_view(), name='api_admin_product_detail'),
    path('admin/attributes/', AdminAttributesAPI.as_view(), name='api_admin_attributes'),
]

