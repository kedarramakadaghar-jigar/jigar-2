(See integration playbook — Emergent Auth testing steps)

Auth methods in this app:
1. JWT email+password — POST /api/auth/register, POST /api/auth/login (returns {token, user}). Send `Authorization: Bearer <jwt>`.
2. Emergent Google Auth — session_id from URL fragment exchanged at POST /api/auth/google/session, sets httpOnly `session_token` cookie (7 day expiry) stored in `user_sessions`.

get_current_user checks: cookie `session_token` -> user_sessions lookup; else Authorization Bearer -> try JWT decode, fallback to user_sessions lookup.

Test user creation (mongosh):
use('test_database');
db.users.insertOne({user_id:'test-user-1', name:'Test User', email:'t@e.com', role:'student', created_at:new Date()});
db.user_sessions.insertOne({user_id:'test-user-1', session_token:'test_session_1', expires_at:new Date(Date.now()+7*864e5), created_at:new Date()});

Backend test:
curl -H "Authorization: Bearer test_session_1" $URL/api/auth/me
