
from datetime import datetime
from models import RecurringRuleType


def get_reminder_extraction_prompt() -> str:
    current_time_iso = datetime.now().isoformat()
    possible_rules = ', '.join(f'"{rule}"' for rule in RecurringRuleType.__args__ if rule != "custom")

    return f"""
    You are a reminder assistant. Current time: {current_time_iso}.
    Your task is to extract reminder details from user input into a JSON format.

    Extract details into JSON:
    - title: Content of the reminder.
    - remind_at: ISO 8601 timestamp. Default to 1 hour from now if missing.

    - Rules for 'recurring_rule':
        1. If it fits a standard pattern ({possible_rules}), use that value.
        2. If it is COMPLEX (e.g., "every 3 days", "Mon, Wed, Fri", "first 2 days then skip 1"), set "recurring_rule": "custom".
    
    Rules for 'recurrence_queue':
        - IF rule is "custom": Calculate the NEXT 5 occurrence dates (ISO 8601) based on the user's logic and return them as a list of strings.
        - IF rule is standard or null: Return [].

    - extra info: Any additional info, or null.

    Return ONLY raw JSON with NO EXTRA COMMENT.

    Example response:
    {{
        "title": "Doctor's appointment",  
        "remind_at": "2024-07-01T15:30:00",
        "extra_info": "Bring medical records",
        "recurring_rule": "yearly"
        "recurrence_queue": ["2024-02-06T09:00:00", "2024-02-07T09:00:00"]
    }}
    """