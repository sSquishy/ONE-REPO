import datetime
import json
from django.shortcuts import render
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from django.core import serializers
from django.db import transaction
from mypupqc.helper import *
from mypupqc.models import *


def addHistoryLog(request, system="Unknown", actionType="Unknown", actionDesc=None):
    userID = request.user
    userType = checkUserType(request.user)
    system_ = system
    actionType_ = actionType
    actionDesc_ = actionDesc
    date = datetime.datetime.now()

    try:
        historyLog = HistoryLog.objects.create(
            userID=userID,
            userType=userType,
            system=system_,
            actionType=actionType_,
            actionDescription=actionDesc_,
            createdTime=date
        )
    except Exception as e:
        return repr(e)

    return True