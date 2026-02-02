import os
import logging
from google import genai
from google.genai import types

logger = logging.getLogger("uvicorn")

class VertexAIClient:
    def __init__(self):
        # Initialize the new Gen AI Client
        self.client = genai.Client(http_options=types.HttpOptions(api_version="v1"))

    def chat_completion(self, messages: list[dict], model: str = "gemini-3-flash-preview", **kwargs) -> str:
        try:
            formatted_contents = []

            for msg in messages:
                role = msg["role"]
                raw_content = msg["content"]
                parts = []

                if isinstance(raw_content, list):
                    # Handle Mixed Content (Text + Audio/Image Parts)
                    for item in raw_content:
                        if isinstance(item, str):
                            parts.append(types.Part.from_text(text=item))
                        elif hasattr(item, "mime_type"): 
                            # If it's already a types.Part (audio/image) created in orchestrator
                            parts.append(item)
                        else:
                            # Fallback for unknown types, try to cast to string
                            parts.append(types.Part.from_text(text=str(item)))
                else:
                    # Simple String
                    parts.append(types.Part.from_text(text=str(raw_content)))

                formatted_contents.append(types.Content(role=role, parts=parts))

            response = self.client.models.generate_content(
                model=model,
                contents=formatted_contents,
                config=types.GenerateContentConfig(
                    temperature=kwargs.get("temperature", 0.7),
                    response_mime_type=kwargs.get("response_mime_type", "text/plain")
                )
            )
            
            return response.text

        except Exception as err:
            logger.exception(f"Error in LLM Client: {err}")
            # Return a fallback JSON to prevent the Orchestrator from crashing entirely
            return {"error": "LLM generation failed."}
    
    def generate_content_with_audio(self, audio_bytes: bytes, prompt: str, mime_type: str = "audio/webm") -> str:
        """
        Sends audio bytes directly (Inline) to Vertex AI.
        Avoids 'files.upload' error and works perfectly for files < 20MB.
        """
        try:
            print(f"🎤 Sending {len(audio_bytes)} bytes inline to Gemini...")

            # 1. Create the Audio Part correctly
            # This wraps the raw bytes so Vertex knows it's media, not text.
            audio_part = types.Part.from_bytes(
                data=audio_bytes,
                mime_type=mime_type
            )

            # 2. Create the Text Part
            text_part = types.Part.from_text(text=prompt)

            # 3. Single "Super-Call"
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[
                    types.Content(
                        role="user",
                        parts=[audio_part, text_part] # Order matters: Audio context first, then Prompt
                    )
                ]
            )
            
            return response.text

        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            raise e