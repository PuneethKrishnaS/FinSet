# pyrefly: ignore [missing-import]
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Income, Expense, UserProfile, Budget, Debt, DebtPayment, Category, ChitFund, ChitContribution, Notification

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('preferred_currency', 'theme')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    username = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'profile')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        if 'username' not in validated_data:
            validated_data['username'] = validated_data.get('email')
        user = User.objects.create_user(**validated_data)
        return user

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ('id', 'user', 'source', 'amount', 'date', 'is_recurring')
        read_only_fields = ('user',)

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('id', 'user', 'category', 'description', 'amount', 'date', 'is_recurring')
        read_only_fields = ('user',)

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ('id', 'user', 'category', 'amount', 'month')
        read_only_fields = ('user',)

class DebtPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebtPayment
        fields = ('id', 'debt', 'amount', 'date', 'note', 'created_at')

class DebtSerializer(serializers.ModelSerializer):
    payments = DebtPaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Debt
        fields = ('id', 'user', 'person_name', 'type', 'amount', 'date', 'is_settled', 'interest_rate', 'interest_period', 'payments')
        read_only_fields = ('user',)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'user', 'name', 'type', 'icon')
        read_only_fields = ('user',)

class ChitContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChitContribution
        fields = ('id', 'chit_fund', 'amount', 'date', 'month_number', 'created_at')

class ChitFundSerializer(serializers.ModelSerializer):
    contributions = ChitContributionSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChitFund
        fields = ('id', 'user', 'name', 'start_date', 'duration_months', 'target_amount', 'contributions')
        read_only_fields = ('user',)
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ("user", "created_at")
