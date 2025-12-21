import re
from app import identify_context

def test():
    # Test SQL
    sql = "select * from users where user_id=10 order by name"
    print(f"SQL: {identify_context(sql)} (Expected: SQL Query)")
    
    # Test Jira
    jira = "PROJ-123"
    print(f"Jira: {identify_context(jira)} (Expected: Jira Ticket)")
    
    # Test Python
    python = "def my_func(): pass"
    print(f"Python: {identify_context(python)} (Expected: Python Code)")
    
    # Test JWT
    # A dummy JWT format: header.payload.signature
    jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    print(f"JWT: {identify_context(jwt)} (Expected: JWT Token)")
    
    # Test IP
    ip = "192.168.1.1"
    print(f"IP: {identify_context(ip)} (Expected: IP Address)")
    
    # Test Plain Text
    text = "Hello World"
    print(f"Text: {identify_context(text)} (Expected: Plain Text)")

if __name__ == "__main__":
    test()
