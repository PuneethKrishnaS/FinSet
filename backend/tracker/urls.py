from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, IncomeViewSet, ExpenseViewSet, DashboardDataView, UserProfileView, BudgetViewSet, DebtViewSet, DebtPaymentViewSet, CategoryViewSet, ProcessRecurringView, ChitFundViewSet, ChitContributionViewSet, PasswordResetRequestView, PasswordResetConfirmView

router = DefaultRouter()
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'debts', DebtViewSet, basename='debt')
router.register(r'debt-payments', DebtPaymentViewSet, basename='debt-payment')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'chit-funds', ChitFundViewSet, basename='chit-fund')
router.register(r'chit-contributions', ChitContributionViewSet, basename='chit-contribution')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard_data'),
    path('process-recurring/', ProcessRecurringView.as_view(), name='process_recurring'),
    path('', include(router.urls)),
]
