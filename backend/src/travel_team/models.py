"""
Travel Plans Database Models
Similar to blog team models but for travel plans
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import uuid

class TravelPlanModel:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Get the absolute path to the database in the backend directory
            import os
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.db_path = os.path.join(backend_dir, "travel_plans.db")
        else:
            self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with travel plans table"""
        with sqlite3.connect(self.db_path) as conn:
            # Read and execute the migration
            try:
                import os
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                migration_path = os.path.join(backend_dir, "migrations", "005_create_travel_plans.sql")
                with open(migration_path, "r") as f:
                    migration_sql = f.read()
                conn.executescript(migration_sql)
                conn.commit()
            except FileNotFoundError:
                # Fallback: create table directly
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS travel_plans (
                        id TEXT PRIMARY KEY,
                        user_id TEXT DEFAULT 'default_user',
                        departure TEXT,
                        destination TEXT NOT NULL,
                        start_date TEXT NOT NULL,
                        end_date TEXT NOT NULL,
                        adults INTEGER DEFAULT 1,
                        children INTEGER DEFAULT 0,
                        budget TEXT,
                        preferences TEXT,
                        status TEXT DEFAULT 'planning',
                        task_id TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
    
    def create_travel_plan(self, plan_data: Dict) -> Dict:
        """Create a new travel plan"""
        plan_id = plan_data.get('id', str(uuid.uuid4()))
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO travel_plans 
                (id, user_id, departure, destination, start_date, end_date, 
                 adults, children, budget, preferences, status, task_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                plan_id,
                plan_data.get('user_id', 'default_user'),
                plan_data.get('departure'),
                plan_data.get('destination'),
                plan_data.get('start_date') or plan_data.get('startDate'),
                plan_data.get('end_date') or plan_data.get('endDate'),
                int(plan_data.get('adults', 1)),
                int(plan_data.get('children', 0)),
                plan_data.get('budget'),
                plan_data.get('preferences'),
                plan_data.get('status', 'planning'),
                plan_data.get('task_id') or plan_data.get('taskId'),
                plan_data.get('created_at') or plan_data.get('createdAt') or datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            conn.commit()
        
        return self.get_travel_plan(plan_id)
    
    def get_travel_plan(self, plan_id: str) -> Optional[Dict]:
        """Get a travel plan by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM travel_plans WHERE id = ?", (plan_id,)
            )
            row = cursor.fetchone()
            
            if row:
                plan = dict(row)
                # Parse result JSON if present
                if plan.get('result'):
                    try:
                        plan['result'] = json.loads(plan['result'])
                    except json.JSONDecodeError:
                        pass  # Keep as string if not valid JSON
                return plan
            return None
    
    def get_all_travel_plans(self, user_id: str = 'default_user') -> List[Dict]:
        """Get all travel plans for a user"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM travel_plans WHERE user_id = ? ORDER BY created_at DESC", 
                (user_id,)
            )
            rows = cursor.fetchall()
            
            plans = []
            for row in rows:
                plan = dict(row)
                # Parse result JSON if present
                if plan.get('result'):
                    try:
                        plan['result'] = json.loads(plan['result'])
                    except json.JSONDecodeError:
                        pass  # Keep as string if not valid JSON
                plans.append(plan)
            
            return plans
    
    def update_travel_plan(self, plan_id: str, updates: Dict) -> Optional[Dict]:
        """Update a travel plan"""
        # Build dynamic update query
        update_fields = []
        values = []
        
        for field, value in updates.items():
            if field not in ['id', 'created_at']:  # Don't update these fields
                update_fields.append(f"{field} = ?")
                values.append(value)
        
        if not update_fields:
            return self.get_travel_plan(plan_id)
        
        # Add updated_at
        update_fields.append("updated_at = ?")
        values.append(datetime.now().isoformat())
        values.append(plan_id)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                f"UPDATE travel_plans SET {', '.join(update_fields)} WHERE id = ?",
                values
            )
            conn.commit()
        
        return self.get_travel_plan(plan_id)
    
    def delete_travel_plan(self, plan_id: str) -> bool:
        """Delete a travel plan"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM travel_plans WHERE id = ?", (plan_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_plans_by_status(self, status: str, user_id: str = 'default_user') -> List[Dict]:
        """Get travel plans by status"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM travel_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC", 
                (user_id, status)
            )
            rows = cursor.fetchall()
            
            plans = []
            for row in rows:
                plan = dict(row)
                # Parse result JSON if present
                if plan.get('result'):
                    try:
                        plan['result'] = json.loads(plan['result'])
                    except json.JSONDecodeError:
                        pass  # Keep as string if not valid JSON
                plans.append(plan)
            
            return plans 
   
    def get_plan_by_task_id(self, task_id: str) -> Optional[Dict]:
        """Get a travel plan by task_id"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM travel_plans WHERE task_id = ?", (task_id,)
            )
            row = cursor.fetchone()
            
            if row:
                plan = dict(row)
                # Parse result JSON if present
                if plan.get('result'):
                    try:
                        plan['result'] = json.loads(plan['result'])
                    except json.JSONDecodeError:
                        pass  # Keep as string if not valid JSON
                return plan
            return None