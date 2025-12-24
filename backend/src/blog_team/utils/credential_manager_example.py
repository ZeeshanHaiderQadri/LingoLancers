"""
Example usage of CredentialManager
"""
from credential_manager import CredentialManager

# Example 1: Basic encryption/decryption
def example_basic():
    """Basic encryption and decryption"""
    manager = CredentialManager()  # Uses ENCRYPTION_KEY from environment
    
    # WordPress credentials
    wordpress_creds = {
        'site_url': 'https://myblog.com',
        'username': 'admin',
        'application_password': 'xxxx xxxx xxxx xxxx'
    }
    
    # Encrypt
    encrypted = manager.encrypt(wordpress_creds)
    print(f"Encrypted: {encrypted[:50]}...")
    
    # Store encrypted in database
    # integration.encrypted_credentials = encrypted
    
    # Later, decrypt when needed
    decrypted = manager.decrypt(encrypted)
    print(f"Site URL: {decrypted['site_url']}")


# Example 2: With validation
def example_with_validation():
    """Encrypt with validation"""
    manager = CredentialManager()
    
    shopify_creds = {
        'shop_url': 'myshop.myshopify.com',
        'access_token': 'shpat_xxxxx'
    }
    
    # Validate and encrypt in one step
    encrypted = manager.encrypt_and_validate(
        shopify_creds,
        required_fields=['shop_url', 'access_token']
    )
    
    print("Credentials validated and encrypted successfully")


# Example 3: Integration with database model
def example_with_database():
    """Using with UserIntegration model"""
    from blog_team.models import UserIntegration, get_db
    
    manager = CredentialManager()
    db = next(get_db())
    
    # Create new integration
    facebook_creds = {
        'page_id': '123456789',
        'access_token': 'EAAxxxxx'
    }
    
    integration = UserIntegration(
        user_id=1,
        platform='facebook',
        status='connected',
        encrypted_credentials=manager.encrypt(facebook_creds),
        platform_metadata={'page_name': 'My Business Page'}
    )
    
    db.add(integration)
    db.commit()
    
    # Later, retrieve and decrypt
    integration = db.query(UserIntegration).filter_by(
        user_id=1,
        platform='facebook'
    ).first()
    
    if integration and integration.is_connected():
        creds = manager.decrypt(integration.encrypted_credentials)
        print(f"Page ID: {creds['page_id']}")


# Example 4: Error handling
def example_error_handling():
    """Proper error handling"""
    from blog_team.utils import DecryptionError, MissingEncryptionKeyError
    
    try:
        manager = CredentialManager()
        
        # Try to decrypt potentially corrupted data
        encrypted_data = "some_encrypted_string"
        creds = manager.decrypt(encrypted_data)
        
    except MissingEncryptionKeyError:
        print("Error: Encryption key not configured")
    except DecryptionError as e:
        print(f"Error: Could not decrypt credentials: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")


if __name__ == "__main__":
    print("CredentialManager Examples")
    print("=" * 60)
    
    # Uncomment to run examples
    # example_basic()
    # example_with_validation()
    # example_with_database()
    # example_error_handling()
