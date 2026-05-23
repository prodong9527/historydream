import json
from pydantic import BaseModel, field_validator
from typing import Optional


class EventResponse(BaseModel):
    id: int
    month: int
    day: int
    year: int
    location: str
    title: str
    narrator: str
    content: str
    image_prompts: Optional[list[str]] = None
    image_urls: Optional[list[str]] = None
    golden_sentence: str

    @field_validator("image_prompts", mode="before")
    @classmethod
    def parse_prompts(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("image_urls", mode="before")
    @classmethod
    def parse_urls(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    class Config:
        from_attributes = True


class SaveStoryRequest(BaseModel):
    event_id: int
    content_snapshot: str


class SavedStoryResponse(BaseModel):
    id: int
    event_id: int
    content_snapshot: str
    saved_at: int

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str


class ThemesResponse(BaseModel):
    themes: list[str]
    chosen: str