from rest_framework import viewsets, permissions
from .models import Expense
from .serializers import ExpenseSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date', 'category']
    ordering_fields = ['date', 'amount']
    
    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
        # Custom filtering for month
        month = self.request.query_params.get('month', None)
        if month:
            # month format: YYYY-MM
            try:
                year, m = month.split('-')
                queryset = queryset.filter(date__year=year, date__month=m)
            except ValueError:
                pass
                
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
