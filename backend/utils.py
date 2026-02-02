
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def calculate_next_occurrence(current_date: datetime, rule: str) -> datetime:
    # --- Days ---
    if rule == "daily":
        return current_date + timedelta(days=1)
    
    # --- Weekdays (Mon-Fri) ---
    elif rule == "weekdays":
        next_date = current_date + timedelta(days=1)
        # If Saturday (5) -> Jump to Monday (+2 days -> 0)
        # If Sunday (6) -> Jump to Monday (+1 day -> 0)
        while next_date.weekday() >= 5: 
            next_date += timedelta(days=1)
        return next_date

    # --- Weekends (Sat-Sun) ---
    elif rule == "weekends":
        next_date = current_date + timedelta(days=1)
        # If Mon(0) through Fri(4) -> Jump to Saturday
        while next_date.weekday() < 5:
            next_date += timedelta(days=1)
        return next_date

    # --- Weeks ---
    elif rule == "weekly":
        return current_date + timedelta(weeks=1)
    elif rule == "biweekly":
        return current_date + timedelta(weeks=2)

    # --- Months (Using relativedelta handles 28th/30th/31st logic) ---
    elif rule == "monthly":
        return current_date + relativedelta(months=1)
    elif rule == "bimonthly":   # Every 2 months
        return current_date + relativedelta(months=2)
    elif rule == "quarterly":   # Every 3 months
        return current_date + relativedelta(months=3)
    elif rule == "triannual":   # Every 4 months
        return current_date + relativedelta(months=4)
    elif rule == "biannual":    # Every 6 months (Half-yearly)
        return current_date + relativedelta(months=6)

    # --- Years ---
    elif rule == "yearly":
        return current_date + relativedelta(years=1)

    return current_date # Safety fallback