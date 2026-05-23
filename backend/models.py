from sqlalchemy import Column, Integer, String, Text, Boolean
from database import Base


class HistoricalEvent(Base):
    __tablename__ = "historical_events"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False)
    day = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
    title = Column(String, nullable=False)
    narrator = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image_prompts = Column(Text, nullable=True)      # JSON array of prompts
    image_urls = Column(Text, nullable=True)        # JSON array of generated image URLs
    golden_sentence = Column(Text, nullable=False)
    is_builtin = Column(Boolean, default=False)


class SavedStory(Base):
    __tablename__ = "saved_stories"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=False)
    content_snapshot = Column(Text, nullable=False)
    saved_at = Column(Integer, nullable=False)