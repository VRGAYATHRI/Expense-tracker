from django.urls import path
from .views import (
    FriendListView, PendingRequestsView, SendRequestView, 
    RespondRequestView, RemoveFriendView, CompareView
)

urlpatterns = [
    path('', FriendListView.as_view(), name='friend_list'),
    path('request/', SendRequestView.as_view(), name='send_request'),
    path('requests/', PendingRequestsView.as_view(), name='pending_requests'),
    path('respond/<int:pk>/', RespondRequestView.as_view(), name='respond_request'),
    path('<int:pk>/', RemoveFriendView.as_view(), name='remove_friend'),
    path('compare/', CompareView.as_view(), name='compare_friends'),
]
