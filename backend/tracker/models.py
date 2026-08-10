from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_currency = models.CharField(max_length=10, default='INR')
    theme = models.CharField(max_length=10, default='light')
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class PushSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField(max_length=500)
    p256dh = models.CharField(max_length=100)
    auth = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'endpoint')

    def __str__(self):
        return f"Push Subscription for {self.user.username}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
        default_categories = [
            {'name': 'Housing', 'icon': 'Home'},
            {'name': 'Food & Dining', 'icon': 'Coffee'},
            {'name': 'Transportation', 'icon': 'Car'},
            {'name': 'Utilities', 'icon': 'Zap'},
            {'name': 'Entertainment', 'icon': 'Film'},
            {'name': 'Shopping', 'icon': 'ShoppingBag'},
            {'name': 'Health & Fitness', 'icon': 'HeartPulse'},
            {'name': 'Other', 'icon': 'MoreHorizontal'}
        ]
        for cat in default_categories:
            Category.objects.create(user=instance, name=cat['name'], type='expense', icon=cat['icon'])

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=10, default='expense', help_text="income or expense")
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Optional icon name")

    class Meta:
        unique_together = ('user', 'name', 'type')

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.type})"

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=255, help_text="e.g. Monthly Salary, Freelance")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username} - {self.source}: {self.amount}"

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=50) # Removing choices to allow custom categories
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.category}: {self.amount}"

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.CharField(max_length=50) # Removing choices to allow custom categories
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField(help_text="Set to the first day of the month")

    class Meta:
        unique_together = ('user', 'category', 'month')

    def __str__(self):
        return f"{self.user.username} - {self.category} Budget: {self.amount}"

class Debt(models.Model):
    DEBT_TYPES = (
        ('lent', 'I Lent (Owed to me)'),
        ('borrowed', 'I Borrowed (I owe)'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    person_name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=DEBT_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    is_settled = models.BooleanField(default=False)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Interest percentage")
    INTEREST_PERIODS = (
        ('monthly', 'Per Month'),
        ('yearly', 'Per Year'),
    )
    interest_period = models.CharField(max_length=10, choices=INTEREST_PERIODS, default='yearly', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} {self.amount} with {self.person_name}"

class DebtPayment(models.Model):
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.debt.person_name} Payment - {self.amount}"

class ChitFund(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chit_funds')
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    duration_months = models.IntegerField(default=12)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class ChitContribution(models.Model):
    chit_fund = models.ForeignKey(ChitFund, on_delete=models.CASCADE, related_name='contributions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    month_number = models.IntegerField(help_text="Which month is this for (1 to duration_months)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.chit_fund.name} - Month {self.month_number} ({self.amount})"
