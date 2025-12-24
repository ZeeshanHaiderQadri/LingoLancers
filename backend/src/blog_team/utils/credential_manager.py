"""
Credential Manager for Blog Writing Team
Handles encryption and decryption of platform credentials
Requirements: 12.11, 13.6
"""
import os
import json
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet, InvalidToken


class CredentialManagerError(Exception):
    """Base exception for credential manager errors"""
    pass


class MissingEncryptionKeyError(CredentialManagerError):
    """Raised when encryption key is not configured"""
    pass


class DecryptionError(CredentialManagerError):
    """Raised when decryption fails"""
    pass


class CredentialManager:
    """
    Manages encryption and decryption of platform credentials
    Uses Fernet symmetric encryption (AES-128 in CBC mode)
    """
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize credential manager
        
        Args:
            encryption_key: Base64-encoded Fernet key. If None, reads from ENCRYPTION_KEY env var
            
        Raises:
            MissingEncryptionKeyError: If no encryption key is provided or found in environment
        """
        if encryption_key is None:
            encryption_key = os.getenv("ENCRYPTION_KEY")
        
        if not encryption_key:
            raise MissingEncryptionKeyError(
                "Encryption key not found. Set ENCRYPTION_KEY environment variable or pass key to constructor."
            )
        
        try:
            self._fernet = Fernet(encryption_key.encode() if isinstance(encryption_key, str) else encryption_key)
        except Exception as e:
            raise MissingEncryptionKeyError(f"Invalid encryption key format: {e}")
    
    def encrypt(self, credentials: Dict[str, Any]) -> str:
        """
        Encrypt credentials dictionary
        
        Args:
            credentials: Dictionary containing platform credentials
            
        Returns:
            Base64-encoded encrypted string
            
        Raises:
            CredentialManagerError: If encryption fails
            
        Example:
            >>> manager = CredentialManager()
            >>> creds = {'api_key': 'secret123', 'site_url': 'https://example.com'}
            >>> encrypted = manager.encrypt(creds)
        """
        try:
            # Convert credentials to JSON string
            json_str = json.dumps(credentials)
            
            # Encrypt the JSON string
            encrypted_bytes = self._fernet.encrypt(json_str.encode())
            
            # Return as base64 string
            return encrypted_bytes.decode()
            
        except Exception as e:
            raise CredentialManagerError(f"Encryption failed: {e}")
    
    def decrypt(self, encrypted_credentials: str) -> Dict[str, Any]:
        """
        Decrypt credentials string
        
        Args:
            encrypted_credentials: Base64-encoded encrypted string
            
        Returns:
            Dictionary containing decrypted credentials
            
        Raises:
            DecryptionError: If decryption fails or data is invalid
            
        Example:
            >>> manager = CredentialManager()
            >>> decrypted = manager.decrypt(encrypted_string)
            >>> print(decrypted['api_key'])
        """
        try:
            # Decrypt the string
            decrypted_bytes = self._fernet.decrypt(encrypted_credentials.encode())
            
            # Parse JSON
            json_str = decrypted_bytes.decode()
            credentials = json.loads(json_str)
            
            return credentials
            
        except InvalidToken:
            raise DecryptionError("Invalid token or corrupted data. Decryption failed.")
        except json.JSONDecodeError as e:
            raise DecryptionError(f"Decrypted data is not valid JSON: {e}")
        except Exception as e:
            raise DecryptionError(f"Decryption failed: {e}")
    
    @staticmethod
    def generate_key() -> str:
        """
        Generate a new Fernet encryption key
        
        Returns:
            Base64-encoded encryption key as string
            
        Example:
            >>> key = CredentialManager.generate_key()
            >>> print(f"ENCRYPTION_KEY={key}")
        """
        return Fernet.generate_key().decode()
    
    def validate_credentials(self, credentials: Dict[str, Any], required_fields: list[str]) -> bool:
        """
        Validate that credentials contain required fields
        
        Args:
            credentials: Credentials dictionary to validate
            required_fields: List of required field names
            
        Returns:
            True if all required fields are present
            
        Raises:
            ValueError: If required fields are missing
        """
        missing_fields = [field for field in required_fields if field not in credentials]
        
        if missing_fields:
            raise ValueError(f"Missing required credential fields: {', '.join(missing_fields)}")
        
        return True
    
    def encrypt_and_validate(
        self, 
        credentials: Dict[str, Any], 
        required_fields: Optional[list[str]] = None
    ) -> str:
        """
        Validate and encrypt credentials in one step
        
        Args:
            credentials: Credentials dictionary
            required_fields: Optional list of required fields to validate
            
        Returns:
            Encrypted credentials string
            
        Raises:
            ValueError: If validation fails
            CredentialManagerError: If encryption fails
        """
        if required_fields:
            self.validate_credentials(credentials, required_fields)
        
        return self.encrypt(credentials)
