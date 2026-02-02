from pydantic import BaseModel, Field, BeforeValidator
from datetime import datetime
from typing import Literal, Optional, Annotated

# Helper to convert Mongo's ObjectId to a string
PyObjectId = Annotated[str, BeforeValidator(str)]

RecurringRuleType = Literal[
    "daily",
    "weekdays",      # Mon-Fri
    "weekends",      # Sat-Sun
    "weekly",
    "biweekly",      # Every 2 weeks
    "monthly",
    "bimonthly",     # Every 2 months
    "quarterly",     # Every 3 months
    "triannual",     # Every 4 months
    "biannual",      # Every 6 months
    "yearly"
]

class ReminderBase(BaseModel):
    user_id: str
    title: str
    extra_info: Optional[str] = None
    remind_at: datetime
    recurring_rule: Optional[RecurringRuleType] = None
    status: str = "pending"  # pending, completed, snoozed

class ReminderCreate(BaseModel):
    """Used when receiving manual input (optional)"""
    title: str
    remind_at: Optional[datetime] = None

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    remind_at: Optional[datetime] = None
    status: Optional[str] = None

class ReminderResponse(ReminderBase):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True