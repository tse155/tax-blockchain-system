from django.contrib import admin
from .models import CustomUser, Company, Share, Transfer

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Company)
admin.site.register(Share)
admin.site.register(Transfer)
