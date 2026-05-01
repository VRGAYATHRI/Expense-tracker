from rest_framework import serializers
from .models import Friendship
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer

class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ('id', 'status', 'created_at', 'friend')

    def get_friend(self, obj):
        request = self.context.get('request')
        if obj.from_user == request.user:
            return UserSerializer(obj.to_user).data
        return UserSerializer(obj.from_user).data

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ('id', 'from_user', 'created_at')

class SendRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
