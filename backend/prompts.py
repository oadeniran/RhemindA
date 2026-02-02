
from datetime import datetime
from models import RecurringRuleType


def get_reminder_extraction_prompt() -> str:
    current_time_iso = datetime.now().isoformat()
    possible_rules = ', '.join(f'"{rule}"' for rule in RecurringRuleType.__args__)

    return f"""
    You are a reminder assistant. Current time: {current_time_iso}.
    Your task is to extract reminder details from user input into a JSON format.

    Extract details into JSON:
    - title: Content of the reminder.
    - remind_at: ISO 8601 timestamp. Default to 1 hour from now if missing.
    - recurring_rule: can only be one of the following values or null:
       {possible_rules}
    - extra info: Any additional info, or null.

    Return ONLY raw JSON with NO EXTRA COMMENT.

    Example response:
    {{
        "title": "Doctor's appointment",  
        "remind_at": "2024-07-01T15:30:00",
        "extra_info": "Bring medical records",
        "recurring_rule": "yearly"
    }}
    """