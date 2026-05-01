from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from django.db.models import Q, Sum
from django.contrib.auth.models import User
from .models import Friendship
from expenses.models import Expense
from .serializers import FriendshipSerializer, FriendRequestSerializer, SendRequestSerializer
from accounts.serializers import UserSerializer
from datetime import datetime

class FriendListView(generics.ListAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user)),
            status='accepted'
        )

class PendingRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(
            to_user=self.request.user,
            status='pending'
        )

class SendRequestView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SendRequestSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            try:
                to_user = User.objects.get(username=username)
                if to_user == request.user:
                    return Response({"error": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if request already exists
                existing = Friendship.objects.filter(
                    (Q(from_user=request.user, to_user=to_user) | 
                     Q(from_user=to_user, to_user=request.user))
                ).first()
                
                if existing:
                    return Response({"error": f"Friendship request already exists with status {existing.status}."}, status=status.HTTP_400_BAD_REQUEST)

                Friendship.objects.create(from_user=request.user, to_user=to_user, status='pending')
                return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RespondRequestView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            friendship = Friendship.objects.get(pk=pk, to_user=request.user, status='pending')
            action = request.data.get('action')
            if action == 'accept':
                friendship.status = 'accepted'
                friendship.save()
                return Response({"message": "Friend request accepted."})
            elif action == 'reject':
                friendship.delete()
                return Response({"message": "Friend request rejected."})
            else:
                return Response({"error": "Invalid action. Use 'accept' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
        except Friendship.DoesNotExist:
            return Response({"error": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

class RemoveFriendView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user)),
            status='accepted'
        )

class CompareView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        month_str = request.query_params.get('month', None)
        if month_str:
            try:
                year, month = map(int, month_str.split('-'))
            except ValueError:
                return Response({"error": "Invalid month format. Use YYYY-MM."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            now = datetime.now()
            year, month = now.year, now.month

        # Get user's accepted friends
        friends_rels = Friendship.objects.filter(
            (Q(from_user=request.user) | Q(to_user=request.user)),
            status='accepted'
        )
        
        users_to_compare = [request.user]
        for rel in friends_rels:
            if rel.from_user == request.user:
                users_to_compare.append(rel.to_user)
            else:
                users_to_compare.append(rel.from_user)

        leaderboard = []
        # For daily comparison chart
        daily_map = {} # date -> {username: amount}

        for u in users_to_compare:
            expenses = Expense.objects.filter(
                user=u,
                date__year=year,
                date__month=month
            )
            
            # Leaderboard data
            total = expenses.aggregate(total=Sum('amount'))['total'] or 0
            categories = list(expenses.values('category').annotate(total=Sum('amount')).order_by('-total')[:3])
            
            leaderboard.append({
                "user": UserSerializer(u).data,
                "total_expenses": total,
                "top_categories": categories
            })

            # Daily data
            daily_totals = expenses.values('date').annotate(total=Sum('amount'))
            for dt in daily_totals:
                d_str = dt['date'].strftime('%Y-%m-%d')
                if d_str not in daily_map:
                    daily_map[d_str] = {}
                daily_map[d_str][u.username] = float(dt['total'])
            
        # Sort by total expenses (highest first)
        leaderboard.sort(key=lambda x: x['total_expenses'], reverse=True)

        # Convert daily_map to sorted list for chart
        daily_comparison = []
        for d_str in sorted(daily_map.keys()):
            entry = {"date": d_str}
            entry.update(daily_map[d_str])
            daily_comparison.append(entry)
        
        return Response({
            "leaderboard": leaderboard,
            "daily_comparison": daily_comparison,
            "usernames": [u.username for u in users_to_compare]
        })

