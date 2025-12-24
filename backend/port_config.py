#!/usr/bin/env python3
"""
Smart Port Configuration for Backend-Frontend Sync
Automatically finds available ports and updates both backend and frontend configs
"""

import socket
import os
import sys

def find_available_port(start_port: int, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No available ports found in range {start_port}-{start_port + max_attempts}")

def update_backend_env(port: int):
    """Update backend .env file with new port"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    # Read current .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update PORT line
    updated = False
    for i, line in enumerate(lines):
        if line.startswith('PORT='):
            lines[i] = f'PORT={port}\n'
            updated = True
            break
    
    # Add PORT if not found
    if not updated:
        lines.append(f'\nPORT={port}\n')
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Updated backend .env: PORT={port}")

def update_frontend_env(port: int):
    """Update frontend .env.local file with new backend URL"""
    frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
    
    if not os.path.exists(frontend_path):
        # Create .env.local if it doesn't exist
        with open(frontend_path, 'w') as f:
            f.write(f'NEXT_PUBLIC_LINGO_API_URL=http://localhost:{port}\n')
        print(f"✅ Created frontend .env.local: NEXT_PUBLIC_LINGO_API_URL=http://localhost:{port}")
        return
    
    # Read current .env.local
    with open(frontend_path, 'r') as f:
        lines = f.readlines()
    
    # Update NEXT_PUBLIC_LINGO_API_URL line
    updated = False
    for i, line in enumerate(lines):
        if line.startswith('NEXT_PUBLIC_LINGO_API_URL='):
            lines[i] = f'NEXT_PUBLIC_LINGO_API_URL=http://localhost:{port}\n'
            updated = True
            break
    
    # Add if not found
    if not updated:
        lines.append(f'\nNEXT_PUBLIC_LINGO_API_URL=http://localhost:{port}\n')
    
    # Write back
    with open(frontend_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Updated frontend .env.local: NEXT_PUBLIC_LINGO_API_URL=http://localhost:{port}")

def main():
    """Main port configuration function"""
    print("🔧 Smart Port Configuration")
    print("=" * 50)
    
    # Find available backend port (starting from 8000)
    print("🔍 Finding available backend port...")
    backend_port = find_available_port(8000)
    print(f"✅ Found available port: {backend_port}")
    
    # Update backend configuration
    print("\n📝 Updating backend configuration...")
    update_backend_env(backend_port)
    
    # Update frontend configuration
    print("\n📝 Updating frontend configuration...")
    update_frontend_env(backend_port)
    
    print("\n" + "=" * 50)
    print("🎉 Port configuration complete!")
    print(f"🔗 Backend will run on: http://localhost:{backend_port}")
    print(f"🔗 Frontend will connect to: http://localhost:{backend_port}")
    print("\n📋 Next steps:")
    print("1. Start backend: cd backend && source venv/bin/activate && python -m src.main")
    print("2. Start frontend: cd frontend && npm run dev")
    print("3. Open browser: http://localhost:3000 (or 3001, 3002, etc.)")
    print("=" * 50)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)