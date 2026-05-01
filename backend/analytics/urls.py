from django.urls import path
from .views import MonthlySummaryView, TrendView

urlpatterns = [
    path('monthly/', MonthlySummaryView.as_view(), name='analytics_monthly'),
    path('trend/', TrendView.as_view(), name='analytics_trend'),
]
