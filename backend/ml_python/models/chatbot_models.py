"""Chatbot models for financial risk education."""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    id: str = Field(..., description="Unique message ID")
    type: MessageType = Field(..., description="Type of message")
    content: str = Field(..., description="Message content", max_length=2000)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Message content cannot be empty")
        return v.strip()


class ChatSession(BaseModel):
    session_id: str = Field(..., description="Unique session ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatMessage] = Field(default_factory=list, description="Chat messages")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Session context")


class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Session ID for continuing conversation")
    user_id: str = Field(..., description="User ID")
    message: str = Field(..., description="User message", min_length=1, max_length=2000)
    portfolio_context: Optional[Dict[str, Any]] = Field(default=None, description="Portfolio context")

    @validator('message')
    def validate_message(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("Message cannot be empty")
        return v.strip()


class ChatResponse(BaseModel):
    session_id: str = Field(..., description="Session ID")
    message_id: str = Field(..., description="Response message ID")
    response: str = Field(..., description="Assistant response")
    confidence: float = Field(..., description="Response confidence score", ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    suggested_questions: Optional[List[str]] = Field(default=None, description="Suggested follow-up questions")


class FeedbackRequest(BaseModel):
    session_id: str = Field(..., description="Session ID")
    message_id: str = Field(..., description="Message ID being rated")
    rating: int = Field(..., description="Rating 1-5", ge=1, le=5)
    feedback: Optional[str] = Field(None, description="Optional feedback text", max_length=500)


class LearningData(BaseModel):
    question: str = Field(..., description="User question")
    response: str = Field(..., description="Assistant response")
    rating: Optional[int] = Field(None, description="User rating", ge=1, le=5)
    feedback: Optional[str] = Field(None, description="User feedback")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Context data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SecurityValidation(BaseModel):
    is_safe: bool = Field(..., description="Whether input is safe")
    risk_level: str = Field(..., description="Risk level: low, medium, high")
    blocked_reasons: List[str] = Field(default_factory=list, description="Reasons for blocking")
    sanitized_input: str = Field(..., description="Cleaned input")