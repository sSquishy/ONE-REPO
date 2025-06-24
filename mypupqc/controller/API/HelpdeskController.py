import json
from datetime import datetime
from django.http import JsonResponse
from mypupqc.models import *
from mypupqc.helper import *
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from mypupqc.controller import HistoryLogsController, SysAdminController


def getUserRole(request):
    if is_faculty(request.user):
        roles = PermissionList.objects.filter(facultyID=request.user.user_id).values_list('permissionName', flat=True)
    elif is_student(request.user) or is_alumni(request.user):
        roles = PermissionList.objects.filter(studentID=request.user.user_id).values_list('permissionName', flat=True)
    else:
        return JsonResponse({'status': 'error', 'message': 'User role not found'}, status=404)

    return JsonResponse({'status': 'success', 'roles': list(roles)})