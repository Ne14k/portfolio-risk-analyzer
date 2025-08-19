"""Local financial sentiment chatbot service."""

import os
import json
import pickle
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import re
import secrets

from ..models.chatbot_models import (
    ChatRequest, ChatResponse, ChatSession, ChatMessage, 
    MessageType, FeedbackRequest, LearningData
)
from .security_service import SecurityService

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    logger.warning("Could not download NLTK data")


class FinancialChatbotService:
    def __init__(self, model_path: str = "models/chatbot"):
        self.model_path = model_path
        self.security_service = SecurityService()
        self.sessions: Dict[str, ChatSession] = {}
        self.learning_data: List[LearningData] = []
        
        # Initialize NLP components
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Financial knowledge base
        self.financial_knowledge = {
            'sharpe_ratio': {
                'definition': "The Sharpe ratio measures risk-adjusted return by comparing your portfolio's return to a risk-free investment, divided by volatility.",
                'simple_explanation': "Think of it like getting the best bang for your buck while considering risk. Higher is better - it means you're getting more return for each unit of risk you take.",
                'examples': ["A Sharpe ratio of 1.0 is considered good", "Above 2.0 is excellent", "Below 0.5 suggests poor risk-adjusted returns"]
            },
            'beta': {
                'definition': "Beta measures how much your portfolio moves compared to the overall market.",
                'simple_explanation': "If the market goes up 10% and your portfolio has a beta of 1.2, you'd expect it to go up about 12%. Beta of 1 means you move with the market, less than 1 means less volatile, more than 1 means more volatile.",
                'examples': ["Beta of 1.0 = moves exactly with market", "Beta of 1.5 = 50% more volatile than market", "Beta of 0.8 = 20% less volatile than market"]
            },
            'volatility': {
                'definition': "Volatility measures how much your portfolio's value swings up and down over time.",
                'simple_explanation': "High volatility means your portfolio value jumps around a lot - like a roller coaster. Low volatility means smoother rides but potentially lower returns.",
                'examples': ["20% volatility means your portfolio might swing ±20% in a year", "Stocks are more volatile than bonds", "Diversification can reduce volatility"]
            },
            'diversification': {
                'definition': "Diversification means spreading your investments across different types of assets, sectors, and regions.",
                'simple_explanation': "Don't put all your eggs in one basket! By owning different types of investments, if one does poorly, others might do well and balance it out.",
                'examples': ["Mix stocks, bonds, and other assets", "Invest in different industries", "Consider international investments"]
            },
            'risk_tolerance': {
                'definition': "Risk tolerance is how much investment volatility and potential loss you can handle emotionally and financially.",
                'simple_explanation': "It's about how well you sleep at night when your investments go down. Some people are okay with big swings for potentially higher returns, others prefer steady, predictable growth.",
                'examples': ["Conservative: mostly bonds and stable investments", "Moderate: balanced mix of stocks and bonds", "Aggressive: mostly stocks and growth investments"]
            }
        }
        
        # Initialize model
        self.model = None
        self.vectorizer = None
        self._initialize_model()
    
    async def initialize(self):
        """Initialize the chatbot service."""
        logger.info("🤖 Initializing Financial Chatbot Service...")
        
        # Create model directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
        
        # Load or train model
        await self._load_or_train_model()
        
        logger.info("✅ Financial Chatbot Service initialized")
    
    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process a chat request and generate response."""
        
        # Security validation
        validation = self.security_service.validate_input(request.message, request.user_id)
        if not validation.is_safe:
            return ChatResponse(
                session_id=request.session_id or self.security_service.generate_session_id(),
                message_id=secrets.token_urlsafe(16),
                response="I'm sorry, but I can't process that request. Please ask me about portfolio risk, investment concepts, or financial education topics.",
                confidence=1.0,
                suggested_questions=self._get_suggested_questions()
            )
        
        # Get or create session
        session = self._get_or_create_session(request)
        
        # Add user message to session
        user_message = ChatMessage(
            id=secrets.token_urlsafe(16),
            type=MessageType.USER,
            content=validation.sanitized_input
        )
        session.messages.append(user_message)
        
        # Generate response
        response_text, confidence = await self._generate_response(
            validation.sanitized_input, 
            session,
            request.portfolio_context
        )
        
        # Create response message
        response_message = ChatMessage(
            id=secrets.token_urlsafe(16),
            type=MessageType.ASSISTANT,
            content=response_text,
            metadata={"confidence": confidence}
        )
        session.messages.append(response_message)
        
        # Update session
        session.updated_at = datetime.utcnow()
        self.sessions[session.session_id] = session
        
        return ChatResponse(
            session_id=session.session_id,
            message_id=response_message.id,
            response=response_text,
            confidence=confidence,
            suggested_questions=self._get_suggested_questions(validation.sanitized_input)
        )
    
    async def submit_feedback(self, feedback: FeedbackRequest):
        """Submit feedback for learning."""
        session = self.sessions.get(feedback.session_id)
        if not session:
            return
        
        # Find the message being rated
        message = None
        user_message = None
        for i, msg in enumerate(session.messages):
            if msg.id == feedback.message_id:
                message = msg
                # Find the corresponding user message
                if i > 0 and session.messages[i-1].type == MessageType.USER:
                    user_message = session.messages[i-1]
                break
        
        if message and user_message:
            # Store learning data
            learning_data = LearningData(
                question=user_message.content,
                response=message.content,
                rating=feedback.rating,
                feedback=feedback.feedback
            )
            self.learning_data.append(learning_data)
            
            # Retrain model if we have enough feedback
            if len(self.learning_data) % 10 == 0:  # Retrain every 10 feedbacks
                await self._retrain_model()
    
    def _get_or_create_session(self, request: ChatRequest) -> ChatSession:
        """Get existing session or create new one."""
        if request.session_id and request.session_id in self.sessions:
            return self.sessions[request.session_id]
        
        session_id = request.session_id or self.security_service.generate_session_id()
        session = ChatSession(
            session_id=session_id,
            user_id=self.security_service.hash_user_id(request.user_id)
        )
        
        # Add system message
        system_message = ChatMessage(
            id=secrets.token_urlsafe(16),
            type=MessageType.SYSTEM,
            content="Hello! I'm your financial education assistant. I can help explain portfolio risk concepts, investment strategies, and analyze your portfolio metrics. What would you like to learn about?"
        )
        session.messages.append(system_message)
        
        self.sessions[session_id] = session
        return session
    
    async def _generate_response(self, user_input: str, session: ChatSession, portfolio_context: Optional[Dict] = None) -> Tuple[str, float]:
        """Generate response to user input."""
        
        # Preprocess input
        processed_input = self._preprocess_text(user_input)
        
        # Check for specific financial concepts
        concept_response = self._check_financial_concepts(user_input, portfolio_context)
        if concept_response:
            return concept_response, 0.9
        
        # Check for greeting or common questions
        greeting_response = self._check_greetings(user_input)
        if greeting_response:
            return greeting_response, 0.8
        
        # Use ML model for sentiment and response generation
        if self.model and self.vectorizer:
            try:
                # Get sentiment
                sentiment = self._predict_sentiment(processed_input)
                
                # Generate response based on sentiment and context
                response = self._generate_contextual_response(user_input, sentiment, portfolio_context)
                confidence = 0.7
                
                return response, confidence
                
            except Exception as e:
                logger.error(f"Error in ML prediction: {e}")
        
        # Fallback response
        return self._get_fallback_response(user_input), 0.3
    
    def _check_financial_concepts(self, user_input: str, portfolio_context: Optional[Dict] = None) -> Optional[str]:
        """Check if user is asking about specific financial concepts."""
        user_input_lower = user_input.lower()
        
        for concept, info in self.financial_knowledge.items():
            concept_keywords = concept.replace('_', ' ').split()
            if any(keyword in user_input_lower for keyword in concept_keywords):
                response = f"{info['simple_explanation']}\n\n"
                
                # Add portfolio-specific context if available
                if portfolio_context:
                    response += self._add_portfolio_context(concept, portfolio_context)
                
                response += f"\n\nExamples:\n" + "\n".join(f"• {example}" for example in info['examples'])
                
                return response
        
        return None
    
    def _add_portfolio_context(self, concept: str, portfolio_context: Dict) -> str:
        """Add portfolio-specific context to explanations."""
        context = ""
        
        if concept == 'sharpe_ratio' and 'sharpe_ratio' in portfolio_context:
            sharpe = portfolio_context['sharpe_ratio']
            if sharpe < 0.5:
                context = f"Your portfolio's Sharpe ratio is {sharpe:.2f}, which suggests you might not be getting enough return for the risk you're taking. "
            elif sharpe > 1.5:
                context = f"Your portfolio's Sharpe ratio is {sharpe:.2f}, which is excellent! You're getting good risk-adjusted returns. "
            else:
                context = f"Your portfolio's Sharpe ratio is {sharpe:.2f}, which is in a reasonable range. "
        
        elif concept == 'volatility' and 'volatility' in portfolio_context:
            vol = portfolio_context['volatility']
            if vol > 0.25:
                context = f"Your portfolio has {vol*100:.1f}% volatility, which is quite high. This means your portfolio value could swing significantly. "
            elif vol < 0.10:
                context = f"Your portfolio has {vol*100:.1f}% volatility, which is relatively low and stable. "
            else:
                context = f"Your portfolio has {vol*100:.1f}% volatility, which is moderate. "
        
        return context
    
    def _check_greetings(self, user_input: str) -> Optional[str]:
        """Check for greetings and common questions."""
        user_input_lower = user_input.lower()
        
        greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
        if any(greeting in user_input_lower for greeting in greetings):
            return "Hello! I'm here to help you understand your portfolio's risk and investment concepts. What would you like to learn about today?"
        
        help_keywords = ['help', 'what can you do', 'how do you work', 'what do you know']
        if any(keyword in user_input_lower for keyword in help_keywords):
            return """I can help you understand:
• Portfolio risk metrics (Sharpe ratio, beta, volatility)
• Diversification and asset allocation
• Investment concepts in simple terms
• Your specific portfolio's characteristics

Feel free to ask me questions like "What is my Sharpe ratio?" or "How can I reduce risk in my portfolio?"""
        
        return None
    
    def _predict_sentiment(self, text: str) -> str:
        """Predict sentiment of input text."""
        if not self.model or not self.vectorizer:
            return "neutral"
        
        try:
            prediction = self.model.predict([text])[0]
            return prediction
        except:
            return "neutral"
    
    def _generate_contextual_response(self, user_input: str, sentiment: str, portfolio_context: Optional[Dict] = None) -> str:
        """Generate contextual response based on sentiment and input."""
        
        # Analyze the question type
        if any(word in user_input.lower() for word in ['why', 'explain', 'what is', 'how does']):
            # Educational question
            return self._generate_educational_response(user_input, portfolio_context)
        
        elif any(word in user_input.lower() for word in ['should i', 'what do you recommend', 'advice']):
            # Advice seeking
            return "I can help you understand your portfolio's characteristics, but I can't provide specific investment advice. Instead, let me explain the concepts that might help you make informed decisions. What specific aspect would you like to understand?"
        
        elif sentiment == "negative":
            # Concerned or frustrated user
            return "I understand you might be concerned about your portfolio. Let me help break down the concepts so you can better understand what's happening. What specific aspect worries you most?"
        
        else:
            # General response
            return "That's an interesting question about portfolio management. Let me help you understand the relevant concepts. Could you be more specific about what aspect you'd like to explore?"
    
    def _generate_educational_response(self, user_input: str, portfolio_context: Optional[Dict] = None) -> str:
        """Generate educational response for learning-focused questions."""
        
        # Look for key financial terms
        financial_terms = ['risk', 'return', 'portfolio', 'investment', 'volatility', 'diversification']
        mentioned_terms = [term for term in financial_terms if term in user_input.lower()]
        
        if mentioned_terms:
            response = f"Great question about {', '.join(mentioned_terms)}! "
            
            if 'risk' in mentioned_terms:
                response += "Investment risk refers to the possibility that your investments might lose value or not perform as expected. "
            
            if 'return' in mentioned_terms:
                response += "Investment return is the money you make (or lose) on an investment, usually expressed as a percentage. "
            
            if 'volatility' in mentioned_terms:
                response += "Volatility measures how much your investment value bounces around - high volatility means big swings up and down. "
            
            response += "\n\nWould you like me to explain any of these concepts in more detail?"
            
            return response
        
        return "That's a thoughtful question! To give you the most helpful explanation, could you tell me which specific investment concept you'd like to understand better?"
    
    def _get_fallback_response(self, user_input: str) -> str:
        """Generate fallback response when unsure."""
        return """I'm not sure about that specific question, but I'd be happy to help you understand portfolio risk and investment concepts. 

Here are some things I can explain:
• Risk metrics like Sharpe ratio and volatility
• How diversification works
• What different investment terms mean
• How to interpret your portfolio's performance

What would you like to learn about?"""
    
    def _get_suggested_questions(self, last_input: str = None) -> List[str]:
        """Generate suggested follow-up questions."""
        base_questions = [
            "What is a good Sharpe ratio?",
            "How can I reduce portfolio risk?",
            "What does volatility mean for my investments?",
            "How important is diversification?",
            "What is beta in investing?"
        ]
        
        if last_input:
            # Contextual suggestions based on last input
            if 'sharpe' in last_input.lower():
                return ["How can I improve my Sharpe ratio?", "What affects Sharpe ratio?", "Is my Sharpe ratio good?"]
            elif 'risk' in last_input.lower():
                return ["How do I measure portfolio risk?", "What are the types of investment risk?", "How can I reduce risk?"]
            elif 'volatility' in last_input.lower():
                return ["What causes high volatility?", "How do I reduce volatility?", "Is volatility always bad?"]
        
        return base_questions[:3]  # Return first 3 as default
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for ML model."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words and len(token) > 2]
        
        return ' '.join(tokens)
    
    async def _load_or_train_model(self):
        """Load existing model or train new one."""
        model_file = os.path.join(self.model_path, 'chatbot_model.pkl')
        vectorizer_file = os.path.join(self.model_path, 'vectorizer.pkl')
        
        if os.path.exists(model_file) and os.path.exists(vectorizer_file):
            # Load existing model
            try:
                with open(model_file, 'rb') as f:
                    self.model = pickle.load(f)
                with open(vectorizer_file, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                logger.info("✅ Loaded existing chatbot model")
                return
            except Exception as e:
                logger.error(f"Error loading model: {e}")
        
        # Train new model with sample data
        await self._train_initial_model()
    
    async def _train_initial_model(self):
        """Train initial model with sample financial sentiment data."""
        logger.info("🏋️ Training initial chatbot model...")
        
        # Sample training data - in real implementation, this would come from the Kaggle dataset
        sample_data = [
            ("I'm worried about my portfolio performance", "negative"),
            ("My investments are doing great", "positive"),  
            ("Can you explain sharpe ratio", "neutral"),
            ("I'm confused about risk metrics", "negative"),
            ("What is diversification", "neutral"),
            ("My returns are excellent this year", "positive"),
            ("I don't understand volatility", "neutral"),
            ("Should I be concerned about beta", "negative"),
            ("Portfolio optimization sounds interesting", "positive"),
            ("How do I reduce investment risk", "neutral")
        ] * 10  # Duplicate for more training data
        
        texts = [item[0] for item in sample_data]
        labels = [item[1] for item in sample_data]
        
        # Preprocess texts
        processed_texts = [self._preprocess_text(text) for text in texts]
        
        # Create pipeline
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        self.model = LogisticRegression(random_state=42)
        
        # Train
        X_train, X_test, y_train, y_test = train_test_split(
            processed_texts, labels, test_size=0.2, random_state=42
        )
        
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        self.model.fit(X_train_vec, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Model accuracy: {accuracy:.3f}")
        
        # Save model
        self._save_model()
        
        logger.info("✅ Initial chatbot model trained")
    
    async def _retrain_model(self):
        """Retrain model with new feedback data."""
        if len(self.learning_data) < 5:  # Need minimum data
            return
        
        logger.info(f"🔄 Retraining model with {len(self.learning_data)} feedback samples")
        
        # Convert feedback to training data
        texts = []
        labels = []
        
        for data in self.learning_data:
            if data.rating is not None:
                texts.append(data.question)
                # Convert rating to sentiment
                if data.rating >= 4:
                    labels.append("positive")
                elif data.rating <= 2:
                    labels.append("negative")
                else:
                    labels.append("neutral")
        
        if len(texts) < 3:  # Need minimum samples
            return
        
        # Preprocess and retrain
        processed_texts = [self._preprocess_text(text) for text in texts]
        
        # Combine with existing knowledge
        X_vec = self.vectorizer.transform(processed_texts)
        self.model.partial_fit(X_vec, labels)
        
        # Save updated model
        self._save_model()
        
        logger.info("✅ Model retrained with feedback data")
    
    def _save_model(self):
        """Save model and vectorizer."""
        try:
            model_file = os.path.join(self.model_path, 'chatbot_model.pkl')
            vectorizer_file = os.path.join(self.model_path, 'vectorizer.pkl')
            
            with open(model_file, 'wb') as f:
                pickle.dump(self.model, f)
            with open(vectorizer_file, 'wb') as f:
                pickle.dump(self.vectorizer, f)
                
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        # Save learning data
        if self.learning_data:
            learning_file = os.path.join(self.model_path, 'learning_data.json')
            try:
                with open(learning_file, 'w') as f:
                    json.dump([data.dict() for data in self.learning_data], f, default=str)
            except Exception as e:
                logger.error(f"Error saving learning data: {e}")
        
        logger.info("🧹 Chatbot service cleaned up")