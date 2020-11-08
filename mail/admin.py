from django.contrib import admin

# Register your models here.
from mail.models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("user", "sender", "subject", "body", "read", "archived")


admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)