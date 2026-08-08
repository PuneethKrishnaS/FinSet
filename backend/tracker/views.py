from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncDay
from .models import Income, Expense, UserProfile, Budget, Debt, DebtPayment, Category, ChitFund, ChitContribution
from .serializers import UserSerializer, IncomeSerializer, ExpenseSerializer, UserProfileSerializer, BudgetSerializer, DebtSerializer, DebtPaymentSerializer, CategorySerializer, ChitFundSerializer, ChitContributionSerializer
from datetime import date
import calendar

def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=400)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('-month')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DebtViewSet(viewsets.ModelViewSet):
    serializer_class = DebtSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Debt.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DebtPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = DebtPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DebtPayment.objects.filter(debt__user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        debt = serializer.validated_data['debt']
        if debt.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not own this Debt.")
        serializer.save()

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChitFundViewSet(viewsets.ModelViewSet):
    serializer_class = ChitFundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChitFund.objects.filter(user=self.request.user).order_by('-start_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChitContributionViewSet(viewsets.ModelViewSet):
    serializer_class = ChitContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChitContribution.objects.filter(chit_fund__user=self.request.user).order_by('chit_fund', 'month_number')

    def perform_create(self, serializer):
        # We don't save user directly here because it's linked via chit_fund
        # But we need to ensure the chit_fund belongs to the user
        chit_fund = serializer.validated_data['chit_fund']
        if chit_fund.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not own this Chit Fund.")
        
        # Optionally, create an Expense here if the user wanted it
        # Expense.objects.create(...)
        serializer.save()

class ProcessRecurringView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        today = date.today()
        # Process recurring expenses
        expenses = Expense.objects.filter(user=request.user, is_recurring=True)
        for expense in expenses:
            latest_expense = Expense.objects.filter(
                user=request.user, 
                description=expense.description, 
                category=expense.category, 
                amount=expense.amount,
                is_recurring=True
            ).order_by('-date').first()
            
            if latest_expense:
                next_date = add_months(latest_expense.date, 1)
                while next_date <= today:
                    Expense.objects.create(
                        user=request.user,
                        category=latest_expense.category,
                        description=latest_expense.description,
                        amount=latest_expense.amount,
                        date=next_date,
                        is_recurring=True
                    )
                    next_date = add_months(next_date, 1)

        # Process recurring incomes
        incomes = Income.objects.filter(user=request.user, is_recurring=True)
        for income in incomes:
            latest_income = Income.objects.filter(
                user=request.user, 
                source=income.source, 
                amount=income.amount,
                is_recurring=True
            ).order_by('-date').first()
            
            if latest_income:
                next_date = add_months(latest_income.date, 1)
                while next_date <= today:
                    Income.objects.create(
                        user=request.user,
                        source=latest_income.source,
                        amount=latest_income.amount,
                        date=next_date,
                        is_recurring=True
                    )
                    next_date = add_months(next_date, 1)

        return Response({'status': 'success', 'message': 'Recurring transactions processed.'})

class DashboardDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        incomes = Income.objects.filter(user=request.user)
        expenses = Expense.objects.filter(user=request.user)
        
        # Total Income & Expense
        total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate unsettled debts for balance adjustments
        unsettled_lent = Debt.objects.filter(user=request.user, type='lent', is_settled=False).aggregate(total=Sum('amount'))['total'] or 0
        unsettled_borrowed = Debt.objects.filter(user=request.user, type='borrowed', is_settled=False).aggregate(total=Sum('amount'))['total'] or 0
        
        # Balance = Income - Expenses - Lent (money left my pocket) + Borrowed (money entered my pocket)
        balance = total_income - total_expense - unsettled_lent + unsettled_borrowed

        # Expenses by category (for pie chart)
        expenses_by_category = list(expenses.values('category').annotate(amount=Sum('amount')).order_by('-amount'))

        # Expenses by day (for line/bar chart over time)
        expenses_by_day = list(expenses.annotate(day=TruncDay('date'))
                                     .values('day')
                                     .annotate(amount=Sum('amount'))
                                     .order_by('day'))

        # Format dates for frontend
        for item in expenses_by_day:
            item['day'] = item['day'].strftime('%Y-%m-%d') if item['day'] else None

        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'balance': balance,
            'expenses_by_category': expenses_by_category,
            'expenses_by_day': expenses_by_day
        })
