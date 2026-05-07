"""FFZone – Payments URL Routes"""

from django.urls import path
from . import views

urlpatterns = [
    # QR Payment
    path("<str:tournament_id>/qr/",     views.submit_qr_payment,              name="submit_qr"),

    # Razorpay
    path("<str:tournament_id>/razorpay/order/",  views.create_razorpay_order,  name="rz_order"),
    path("<str:tournament_id>/razorpay/verify/", views.verify_razorpay_payment, name="rz_verify"),

    # Admin – Approval
    path("pending/",                         views.list_pending_payments,              name="pending"),
    path("<str:tournament_id>/all/",         views.all_registrations_for_tournament,   name="all_regs"),
    path("<str:registration_id>/approve/",   views.approve_payment,                    name="approve"),
    path("<str:registration_id>/reject/",    views.reject_payment,                     name="reject"),
]
