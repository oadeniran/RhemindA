import json
from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile, HTTPException

from db import db_instance
from models import ReminderResponse
from ai_client import VertexAIClient
from prompts import get_reminder_extraction_prompt
from utils import calculate_next_occurrence

# Initialize AI Client
ai = VertexAIClient()

async def process_reminder(
    user_id: str,
    text: str = None, 
    audio_file: UploadFile = None,
    manual_title: str = None,
    manual_remind_at: str = None,
    manual_rule: str = None,
    manual_extra_info: str = None,
    creation_mode: str = "manual"
):
    collection = db_instance.get_collection("reminders")
    new_reminder = {}

    # --- PATH A: Manual Entry (Fast, No AI) ---
    if manual_title and manual_remind_at:
        try:
            # Parse the datetime string from Frontend
            dt_obj = datetime.fromisoformat(manual_remind_at)
        except ValueError:
            # Fallback if format is weird
            dt_obj = datetime.now()

        new_reminder = {
            "title": manual_title,
            "remind_at": dt_obj,
            "recurring_rule": manual_rule if manual_rule and manual_rule != "none" else None,
            "extra_info": manual_extra_info,
            "status": "pending",
            "created_at": datetime.now()
        }

    # --- PATH B: AI Extraction (Voice/Text) ---
    else:
        prompt = get_reminder_extraction_prompt()
        try:
            if audio_file:
                audio_bytes = await audio_file.read()
                response_text = ai.generate_content_with_audio(audio_bytes, prompt)
            else:
                response_text = ai.chat_completion(
                    [{"role": "user", "content": f"{prompt}\nInput: {text}"}],
                    response_mime_type="application/json"
                )
            
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            parsed_data = json.loads(clean_text)

            new_reminder = {
                "title": parsed_data.get("title"),
                "remind_at": datetime.fromisoformat(parsed_data.get("remind_at")),
                "recurring_rule": parsed_data.get("recurring_rule"),
                "extra_info": parsed_data.get("extra_info"),
                "status": "pending",
                "created_at": datetime.now()
            }
        except Exception as e:
            print(f"AI Error: {e}")
            raise HTTPException(status_code=500, detail="AI Processing Failed")
    
    new_reminder["user_id"] = user_id
    new_reminder['creation_mode'] = creation_mode
    # --- Final Step: Save to DB ---
    result = await collection.insert_one(new_reminder)
    
    # Return formatted response
    new_reminder["_id"] = result.inserted_id
    return ReminderResponse(**new_reminder)

async def get_recent_reminders(user_id: str = "default_user", limit: int = 10):
    """Logic for Home Page"""
    if not user_id:
        user_id = "default_user"
    collection = db_instance.get_collection("reminders")
    cursor = collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    return [ReminderResponse(**doc) async for doc in cursor]

async def get_all_history(user_id: str = "default_user"):
    """Logic for History Page"""
    if not user_id:
        user_id = "default_user"
    collection = db_instance.get_collection("reminders")
    # Sort by remind_at descending
    cursor = collection.find({"user_id": user_id}).sort("remind_at", -1)
    return [ReminderResponse(**doc) async for doc in cursor]

async def update_reminder_status(reminder_id: str, updates: dict):
    collection = db_instance.get_collection("reminders")
    
    # 1. Update the current reminder
    if "_id" in updates: del updates["_id"]
    
    await collection.update_one(
        {"_id": ObjectId(reminder_id)}, 
        {"$set": updates}
    )

    # 2. CHECK FOR RECURRENCE LOGIC
    # If we just marked it as "completed", checks if we need to spawn a new one
    if updates.get("status") == "completed":
        # Fetch the reminder we just updated to get its rule
        original_reminder = await collection.find_one({"_id": ObjectId(reminder_id)})
        
        rule = original_reminder.get("recurring_rule")
        if rule and rule != "none": # "none" check for safety
            
            # Calculate next date based on the OLD scheduled date (not today's date)
            # This prevents drift if I complete a daily task late
            old_date = original_reminder["remind_at"]
            next_date = calculate_next_occurrence(old_date, rule)
            
            # Create the clone
            new_reminder = {
                "user_id": original_reminder["user_id"],
                "title": original_reminder["title"],
                "remind_at": next_date,
                "recurring_rule": rule, # Keep the rule going!
                "status": "pending",
                "created_at": datetime.now()
            }
            
            await collection.insert_one(new_reminder)
            print(f"🔄 Recurring Rule Triggered: Created new reminder for {next_date}")

    return {"status": "success", "updated_id": reminder_id}

async def delete_reminder(reminder_id: str):
    collection = db_instance.get_collection("reminders")
    await collection.delete_one({"_id": ObjectId(reminder_id)})
    return {"status": "deleted", "deleted_id": reminder_id}