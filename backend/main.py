from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional

from db import db_instance
import logic
from models import ReminderResponse, ReminderUpdate

# Lifecycle manager to handle DB connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    db_instance.connect()
    yield
    db_instance.close()

app = FastAPI(title="Sam's Hackathon API", lifespan=lifespan, docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for hackathons)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/reminders/create", response_model=ReminderResponse)
async def create_reminder(
    # AI Fields
    text: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None),
    # Manual Fields
    title: Optional[str] = Form(None),
    remind_at: Optional[str] = Form(None),
    recurring_rule: Optional[str] = Form(None),
    extra_info: Optional[str] = Form(None),
    # Required
    user_id: str = Form(...),
    mode: str = Form("manual"), 
    local_time: Optional[str] = Form(None)
):
    print(f"Received create_reminder request with mode: {mode}")
    return await logic.process_reminder(
        user_id=user_id,
        text=text, 
        audio_file=file,
        manual_title=title,
        manual_remind_at=remind_at,
        manual_rule=recurring_rule,
        manual_extra_info=extra_info,
        creation_mode=mode,
        local_time=local_time
    )

@app.get("/reminders/home/{user_id}", response_model=List[ReminderResponse])
async def home_feed(user_id: str):
    """Returns the 2 most recent reminders for the Home Screen"""
    return await logic.get_recent_reminders(user_id=user_id, limit=2)

@app.get("/reminders/history/{user_id}", response_model=List[ReminderResponse])
async def history_feed(user_id: str):
    """Returns full history sorted by date"""
    return await logic.get_all_history(user_id=user_id)

@app.put("/reminders/{reminder_id}")
async def update_reminder(reminder_id: str, payload: ReminderUpdate):
    """
    Used for Editing Text or Snoozing.
    To Snooze: Send {"status": "snoozed", "remind_at": "NEW_ISO_DATE"}
    To Dismiss: Send {"status": "completed"}
    """
    # Exclude unset fields so we don't overwrite with nulls
    update_data = payload.model_dump(exclude_unset=True) 
    return await logic.update_reminder_status(reminder_id, update_data)

@app.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str):
    return await logic.delete_reminder(reminder_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)