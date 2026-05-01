from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from expenses.models import Expense
from datetime import datetime
from dateutil.relativedelta import relativedelta

class MonthlySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month_str = request.query_params.get('month', None)
        
        if month_str:
            try:
                year, month = map(int, month_str.split('-'))
            except ValueError:
                return Response({"error": "Invalid month format. Use YYYY-MM."}, status=400)
        else:
            now = datetime.now()
            year, month = now.year, now.month

        expenses = Expense.objects.filter(
            user=request.user,
            date__year=year,
            date__month=month
        )

        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0

        # Category breakdown
        categories = expenses.values('category').annotate(total=Sum('amount')).order_by('-total')

        # Daily breakdown
        daily = expenses.values('date').annotate(total=Sum('amount')).order_by('date')

        return Response({
            "total_expenses": total_expenses,
            "category_breakdown": categories,
            "daily_breakdown": daily
        })

class TrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            months = int(request.query_params.get('months', 6))
        except ValueError:
            months = 6

        end_date = datetime.now()
        start_date = end_date - relativedelta(months=months - 1)
        start_date = start_date.replace(day=1)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        )

        trend_data = []
        current_date = start_date
        while current_date <= end_date:
            month_expenses = expenses.filter(
                date__year=current_date.year,
                date__month=current_date.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            trend_data.append({
                "month": current_date.strftime('%Y-%m'),
                "total": month_expenses
            })
            current_date += relativedelta(months=1)

        return Response(trend_data)
