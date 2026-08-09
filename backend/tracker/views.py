from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncDay
from .models import Income, Expense, UserProfile, Budget, Debt, DebtPayment, Category, ChitFund, ChitContribution, Notification
from .serializers import UserSerializer, IncomeSerializer, ExpenseSerializer, UserProfileSerializer, BudgetSerializer, DebtSerializer, DebtPaymentSerializer, CategorySerializer, ChitFundSerializer, ChitContributionSerializer
from datetime import date
import calendar
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
import os

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
        user = request.user
        
        # Update User fields if provided
        user_updated = False
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
            user_updated = True
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
            user_updated = True
            
        if user_updated:
            user.save()

        # Update UserProfile fields
        profile = request.user.profile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=400)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'User deleted successfully.'})

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Both old and new passwords are required.'}, status=400)
            
        if not request.user.check_password(old_password):
            return Response({'error': 'Incorrect old password.'}, status=400)
            
        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password updated successfully.'})

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        # We need a serializer here, let's use the one we just created
        from .serializers import NotificationSerializer
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        action = request.data.get('action')
        if action == 'mark_read':
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'message': 'Notifications marked as read'})
        elif action == 'clear_all':
            Notification.objects.filter(user=request.user).delete()
            return Response({'message': 'Notifications cleared'})
        
        # Mark specific notification read
        notification_id = request.data.get('id')
        if notification_id:
            try:
                notif = Notification.objects.get(id=notification_id, user=request.user)
                notif.is_read = True
                notif.save()
                return Response({'message': 'Marked read'})
            except Notification.DoesNotExist:
                return Response({'error': 'Not found'}, status=404)
                
        return Response({'error': 'Invalid action'}, status=400)

class ExportDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        incomes = IncomeSerializer(Income.objects.filter(user=request.user), many=True).data
        expenses = ExpenseSerializer(Expense.objects.filter(user=request.user), many=True).data
        budgets = BudgetSerializer(Budget.objects.filter(user=request.user), many=True).data
        debts = DebtSerializer(Debt.objects.filter(user=request.user), many=True).data
        categories = CategorySerializer(Category.objects.filter(user=request.user), many=True).data
        chit_funds = ChitFundSerializer(ChitFund.objects.filter(user=request.user), many=True).data
        
        data = {
            'incomes': incomes,
            'expenses': expenses,
            'budgets': budgets,
            'debts': debts,
            'categories': categories,
            'chit_funds': chit_funds,
        }
        return Response(data)

class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Securely get frontend URL from CORS allowed origins
            origin = request.headers.get('Origin')
            allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
            
            if origin in allowed_origins:
                frontend_url = origin
            elif allowed_origins:
                frontend_url = allowed_origins[0]
            else:
                frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
                
            # Strip trailing slash if any
            frontend_url = frontend_url.rstrip('/')
            
            reset_url = f"{frontend_url}/reset-password/{uidb64}/{token}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <style>
                body {{
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #ffffff;
                    color: #1e293b;
                    margin: 0;
                    padding: 40px 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                }}
                .logo-container {{
                    margin-bottom: 30px;
                }}
                .logo {{
                    height: 40px;
                }}
                h2 {{
                    font-size: 24px;
                    margin-top: 0;
                }}
                p {{
                    font-size: 16px;
                    line-height: 1.6;
                    color: #475569;
                }}
                .btn {{
                    background: #ec4899;
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 30px;
                    font-weight: bold;
                    display: inline-block;
                    font-size: 16px;
                    margin: 35px 0;
                }}
                .footer {{
                    margin-top: 40px;
                    color: #94a3b8;
                    font-size: 12px;
                }}
                @media (prefers-color-scheme: dark) {{
                    body {{
                        background-color: #0f172a;
                        color: #f8fafc;
                    }}
                    p {{
                        color: #cbd5e1;
                    }}
                }}
            </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo-container">
                        <img src="{frontend_url}/FinSet_Logo.png" alt="FinSet" class="logo" />
                    </div>
                    <h2>Password Reset Request</h2>
                    <p>
                        Hello,<br><br>
                        We received a request to reset your password for your FinSet account. Click the button below to securely choose a new password.
                    </p>
                    <div>
                        <a href="{reset_url}" class="btn">Reset Password</a>
                    </div>
                    <p style="font-size: 14px; color: #94a3b8;">
                        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                    <div class="footer">
                        &copy; 2026 FinSet Platform. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """
            
            try:
                send_mail(
                    subject='FinSet - Password Reset Request',
                    message=f'Click the link below to reset your password:\n\n{reset_url}',
                    html_message=html_content,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@finset.com'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                print("DEBUG: Email successfully handed off to Gmail SMTP!")
            except Exception as e:
                print("DEBUG: Failed to send email via SMTP:", str(e))
        else:
            print("DEBUG: User not found for email:", email)
        
        # We always return success to prevent email enumeration attacks
        return Response({'message': 'If an account with that email exists, we have sent a password reset link.'})

class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None:
            token_generator = PasswordResetTokenGenerator()
            if token_generator.check_token(user, token):
                return Response({'valid': True})
        return Response({'valid': False, 'error': 'The reset link is invalid or has expired.'}, status=400)

    def post(self, request, uidb64, token):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': 'New password is required.'}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None:
            token_generator = PasswordResetTokenGenerator()
            if token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password has been reset successfully.'})
            else:
                return Response({'error': 'The reset link is invalid or has expired.'}, status=400)
        return Response({'error': 'The reset link is invalid.'}, status=400)

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
        expense = serializer.save(user=self.request.user)
        
        # Check budget alerts (80%)
        month = expense.date.replace(day=1)
        budget = Budget.objects.filter(user=self.request.user, category=expense.category, month=month).first()
        
        if budget:
            total_spent = Expense.objects.filter(
                user=self.request.user,
                category=expense.category,
                date__year=expense.date.year,
                date__month=expense.date.month
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            threshold = float(budget.amount) * 0.8
            if total_spent >= threshold and (total_spent - float(expense.amount)) < threshold:
                # Crossed the 80% threshold just now
                from .utils import create_notification
                create_notification(
                    self.request.user,
                    "Budget Alert! ⚠️",
                    f"You have used over 80% of your {expense.category.name} budget for this month."
                )

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
