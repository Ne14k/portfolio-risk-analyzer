"""Security service for input validation and filtering."""

import re
import hashlib
import secrets
from typing import List, Tuple, Set
from datetime import datetime
from better_profanity import profanity
from cryptography.fernet import Fernet
import logging

from ..models.chatbot_models import SecurityValidation

logger = logging.getLogger(__name__)


class SecurityService:
    def __init__(self, encryption_key: str = None):
        self.profanity = profanity
        self.profanity.load_censor_words()
        
        # Initialize encryption
        if encryption_key:
            self.cipher = Fernet(encryption_key.encode()[:44] + b'=')
        else:
            self.cipher = Fernet(Fernet.generate_key())
        
        # Suspicious patterns
        self.suspicious_patterns = [
            r'(?i)api[_-]?key',
            r'(?i)secret[_-]?key',
            r'(?i)password',
            r'(?i)token',
            r'(?i)bearer\s+[a-zA-Z0-9]+',
            r'(?i)authorization:\s*bearer',
            r'(?i)<script.*?</script>',
            r'(?i)javascript:',
            r'(?i)on\w+\s*=',
            r'(?i)eval\s*\(',
            r'(?i)exec\s*\(',
            r'(?i)system\s*\(',
            r'(?i)import\s+os',
            r'(?i)__import__',
            r'(?i)subprocess',
            r'(?i)\.\./',
            r'(?i)file://',
            r'(?i)ftp://',
            r'(?i)\\x[0-9a-fA-F]{2}',
            r'(?i)%[0-9a-fA-F]{2}',
        ]
        
        # Financial terms that are allowed
        self.allowed_financial_terms = {
            'api', 'key', 'performance', 'indicator', 'private', 'public',
            'security', 'bond', 'stock', 'return', 'risk', 'portfolio',
            'asset', 'allocation', 'diversification', 'volatility',
            'sharpe', 'beta', 'alpha', 'correlation', 'dividend'
        }
        
        # Rate limiting
        self.rate_limit_store = {}
        self.MAX_REQUESTS_PER_HOUR = 100
        
    def validate_input(self, text: str, user_id: str = None) -> SecurityValidation:
        """Comprehensive input validation and sanitization."""
        
        # Rate limiting check
        if user_id and not self._check_rate_limit(user_id):
            return SecurityValidation(
                is_safe=False,
                risk_level="high",
                blocked_reasons=["Rate limit exceeded"],
                sanitized_input=""
            )
        
        # Initialize validation result
        blocked_reasons = []
        risk_level = "low"
        
        # Check for profanity
        if self.profanity.contains_profanity(text):
            blocked_reasons.append("Contains inappropriate language")
            risk_level = "medium"
        
        # Check for suspicious patterns
        for pattern in self.suspicious_patterns:
            matches = re.findall(pattern, text)
            if matches:
                # Check if it's a legitimate financial term
                if not any(term.lower() in self.allowed_financial_terms 
                          for match in matches for term in match.split()):
                    blocked_reasons.append(f"Contains suspicious pattern: {pattern}")
                    risk_level = "high"
        
        # Check for excessive length
        if len(text) > 2000:
            blocked_reasons.append("Input too long")
            risk_level = "medium"
        
        # Check for repeated characters (potential spam)
        if self._has_excessive_repetition(text):
            blocked_reasons.append("Excessive character repetition detected")
            risk_level = "medium"
        
        # Check for potential SQL injection patterns
        sql_patterns = [
            r'(?i)(union\s+select|drop\s+table|delete\s+from|insert\s+into)',
            r'(?i)(or\s+1\s*=\s*1|and\s+1\s*=\s*1)',
            r'(?i)(--|#|/\*|\*/)',
        ]
        
        for pattern in sql_patterns:
            if re.search(pattern, text):
                blocked_reasons.append("Potential SQL injection attempt")
                risk_level = "high"
        
        # Sanitize input
        sanitized = self._sanitize_input(text)
        
        # Determine if input is safe
        is_safe = risk_level != "high" and len(blocked_reasons) == 0
        
        return SecurityValidation(
            is_safe=is_safe,
            risk_level=risk_level,
            blocked_reasons=blocked_reasons,
            sanitized_input=sanitized
        )
    
    def _check_rate_limit(self, user_id: str) -> bool:
        """Check if user has exceeded rate limit."""
        current_time = datetime.utcnow().timestamp()
        user_requests = self.rate_limit_store.get(user_id, [])
        
        # Remove requests older than 1 hour
        user_requests = [req_time for req_time in user_requests 
                        if current_time - req_time < 3600]
        
        # Check if limit exceeded
        if len(user_requests) >= self.MAX_REQUESTS_PER_HOUR:
            return False
        
        # Add current request
        user_requests.append(current_time)
        self.rate_limit_store[user_id] = user_requests
        
        return True
    
    def _has_excessive_repetition(self, text: str) -> bool:
        """Check for excessive character or word repetition."""
        # Check for repeated characters
        for i in range(len(text) - 5):
            if len(set(text[i:i+6])) == 1:  # 6 identical characters in a row
                return True
        
        # Check for repeated words
        words = text.split()
        if len(words) > 3:
            for i in range(len(words) - 2):
                if words[i] == words[i+1] == words[i+2]:  # 3 identical words
                    return True
        
        return False
    
    def _sanitize_input(self, text: str) -> str:
        """Sanitize input by removing/replacing dangerous content."""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove JavaScript
        text = re.sub(r'(?i)javascript:[^"\s]*', '', text)
        
        # Remove event handlers
        text = re.sub(r'(?i)on\w+\s*=\s*[^"\s]*', '', text)
        
        # Clean profanity
        text = self.profanity.censor(text)
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Limit length
        if len(text) > 2000:
            text = text[:2000] + "..."
        
        return text
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data for storage."""
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data."""
        return self.cipher.decrypt(encrypted_data.encode()).decode()
    
    def generate_session_id(self) -> str:
        """Generate a secure session ID."""
        return secrets.token_urlsafe(32)
    
    def hash_user_id(self, user_id: str) -> str:
        """Hash user ID for privacy."""
        return hashlib.sha256(user_id.encode()).hexdigest()[:16]