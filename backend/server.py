from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt, bcrypt, requests
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"

app = FastAPI(title="TradeAcademy API")
api = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------- Helpers -----------------
def now_utc():
    return datetime.now(timezone.utc)

def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_pw(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def make_jwt(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": now_utc() + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def public_user(u: dict) -> dict:
    return {k: u.get(k) for k in ["user_id", "name", "email", "role", "picture", "auth_provider", "created_at"]}


# ----------------- Models -----------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class GoogleSessionIn(BaseModel):
    session_id: str

class ForgotIn(BaseModel):
    email: EmailStr

class ProfileUpdate(BaseModel):
    name: Optional[str] = None

class LessonIn(BaseModel):
    module_id: str
    title: str
    description: str = ""
    objectives: List[str] = []
    video_url: str = ""
    duration: str = "10 min"
    order: int = 0
    is_free: bool = False

class ModuleIn(BaseModel):
    course_id: str
    title: str
    description: str = ""
    order: int = 0
    is_free: bool = False

class CourseIn(BaseModel):
    title: str
    description: str = ""
    level: str = "All Levels"
    order: int = 0

class LiveSessionIn(BaseModel):
    topic: str
    description: str = ""
    date: str
    time: str
    instructor: str = ""
    join_url: str = ""
    level: str = "All Levels"

class TestimonialIn(BaseModel):
    name: str
    role: str = ""
    content: str
    rating: int = 5
    avatar: str = ""

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class LessonComplete(BaseModel):
    lesson_id: str


# ----------------- Auth dependency -----------------
async def get_token(request: Request) -> Optional[str]:
    tok = request.cookies.get("session_token")
    if tok:
        return tok
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None

async def resolve_user(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    # Try JWT first
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        u = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if u:
            return u
    except Exception:
        pass
    # Fallback: emergent session token
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if sess:
        exp = sess.get("expires_at")
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp)
        if exp and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp and exp < now_utc():
            return None
        return await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return None

async def current_user(request: Request) -> dict:
    u = await resolve_user(await get_token(request))
    if not u:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return u

async def admin_user(request: Request) -> dict:
    u = await current_user(request)
    if u.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return u


# ----------------- Auth routes -----------------
# NOTE: Public self-registration is disabled. Accounts are created by admins only
# (see POST /api/admin/users). Students log in with credentials issued by an admin.

@api.post("/auth/login")
async def login(body: LoginIn):
    u = await db.users.find_one({"email": body.email.lower()}, {"_id": 0})
    if not u or not u.get("password_hash") or not verify_pw(body.password, u["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    return {"token": make_jwt(u["user_id"]), "user": public_user(u)}
async def me(request: Request):
    u = await current_user(request)
    return public_user(u)

@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    tok = await get_token(request)
    if tok:
        await db.user_sessions.delete_one({"session_token": tok})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

class PasswordChange(BaseModel):
    current_password: Optional[str] = None
    new_password: str

@api.put("/auth/profile")
async def update_profile(body: ProfileUpdate, request: Request):
    u = await current_user(request)
    if body.name:
        await db.users.update_one({"user_id": u["user_id"]}, {"$set": {"name": body.name}})
        u["name"] = body.name
    return public_user(u)

@api.post("/auth/change-password")
async def change_password(body: PasswordChange, request: Request):
    u = await current_user(request)
    if len(body.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    has_password = bool(u.get("password_hash"))
    if has_password:
        if not body.current_password:
            raise HTTPException(400, "Current password is required")
        if not verify_pw(body.current_password, u["password_hash"]):
            raise HTTPException(400, "Current password is incorrect")
        if verify_pw(body.new_password, u["password_hash"]):
            raise HTTPException(400, "New password must be different from the current password")
    await db.users.update_one(
        {"user_id": u["user_id"]},
        {"$set": {"password_hash": hash_pw(body.new_password)}})
    msg = "Password updated successfully" if has_password else "Password set — you can now log in with your email and password"
    return {"ok": True, "message": msg}


# ----------------- Course content -----------------
@api.get("/courses")
async def list_courses():
    return await db.courses.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api.get("/courses/{course_id}/full")
async def course_full(course_id: str):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(404, "Course not found")
    modules = await db.modules.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(200)
    for m in modules:
        m["lessons"] = await db.lessons.find({"module_id": m["module_id"]}, {"_id": 0}).sort("order", 1).to_list(200)
    course["modules"] = modules
    return course

@api.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    l = await db.lessons.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not l:
        raise HTTPException(404, "Lesson not found")
    return l


# ----------------- Progress -----------------
@api.get("/progress")
async def get_progress(request: Request):
    u = await current_user(request)
    total = await db.lessons.count_documents({})
    done = await db.progress.find({"user_id": u["user_id"], "completed": True}, {"_id": 0}).to_list(1000)
    done_ids = [d["lesson_id"] for d in done]
    pct = round(len(done_ids) / total * 100) if total else 0
    return {"total_lessons": total, "completed_lessons": len(done_ids),
            "percentage": pct, "completed_ids": done_ids}

@api.post("/progress/complete")
async def complete_lesson(body: LessonComplete, request: Request):
    u = await current_user(request)
    await db.progress.update_one(
        {"user_id": u["user_id"], "lesson_id": body.lesson_id},
        {"$set": {"completed": True, "completed_at": now_utc().isoformat()}}, upsert=True)
    return {"ok": True}

@api.post("/progress/uncomplete")
async def uncomplete_lesson(body: LessonComplete, request: Request):
    u = await current_user(request)
    await db.progress.update_one(
        {"user_id": u["user_id"], "lesson_id": body.lesson_id},
        {"$set": {"completed": False}}, upsert=True)
    return {"ok": True}


# ----------------- Live sessions / testimonials / contact -----------------
@api.get("/live-sessions")
async def live_sessions():
    return await db.live_sessions.find({}, {"_id": 0}).sort("date", 1).to_list(100)

@api.get("/testimonials")
async def testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(100)

@api.post("/contact")
async def contact(body: ContactIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_utc().isoformat()
    await db.contacts.insert_one(doc)
    return {"ok": True, "message": "Thanks for reaching out! We'll get back to you soon."}


# ----------------- Admin -----------------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(admin_user)):
    return {
        "users": await db.users.count_documents({}),
        "students": await db.users.count_documents({"role": "student"}),
        "courses": await db.courses.count_documents({}),
        "modules": await db.modules.count_documents({}),
        "lessons": await db.lessons.count_documents({}),
        "live_sessions": await db.live_sessions.count_documents({}),
        "contacts": await db.contacts.count_documents({}),
    }

@api.get("/admin/users")
async def admin_users(admin: dict = Depends(admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    total = await db.lessons.count_documents({})
    for u in users:
        done = await db.progress.count_documents({"user_id": u["user_id"], "completed": True})
        u["progress"] = {"completed": done, "total": total, "percentage": round(done / total * 100) if total else 0}
    return users

class RoleIn(BaseModel):
    role: str

class AdminCreateUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class AdminResetPassword(BaseModel):
    new_password: str

@api.post("/admin/users")
async def admin_create_user(body: AdminCreateUser, admin: dict = Depends(admin_user)):
    if body.role not in ("admin", "student"):
        raise HTTPException(400, "Invalid role")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(400, "An account with this email already exists")
    uid = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": uid, "name": body.name, "email": body.email.lower(),
        "password_hash": hash_pw(body.password), "role": body.role,
        "picture": "", "auth_provider": "password", "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(doc)
    return public_user(doc)

@api.post("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, body: AdminResetPassword, admin: dict = Depends(admin_user)):
    if len(body.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    target = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target:
        raise HTTPException(404, "User not found")
    await db.users.update_one({"user_id": user_id},
                              {"$set": {"password_hash": hash_pw(body.new_password), "auth_provider": "password"}})
    return {"ok": True, "message": "Password reset successfully"}

@api.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(admin_user)):
    if user_id == admin["user_id"]:
        raise HTTPException(400, "You cannot delete your own account")
    target = await db.users.find_one({"user_id": user_id})
    if not target:
        raise HTTPException(404, "User not found")
    await db.users.delete_one({"user_id": user_id})
    await db.progress.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"ok": True}

@api.put("/admin/users/{user_id}/role")
async def set_user_role(user_id: str, body: RoleIn, admin: dict = Depends(admin_user)):
    if body.role not in ("admin", "student"):
        raise HTTPException(400, "Invalid role")
    if user_id == admin["user_id"]:
        raise HTTPException(400, "You cannot change your own role")
    target = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target:
        raise HTTPException(404, "User not found")
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": body.role}})
    return {"ok": True, "user_id": user_id, "role": body.role}

# Course CRUD
@api.post("/admin/courses")
async def create_course(body: CourseIn, admin: dict = Depends(admin_user)):
    doc = body.model_dump(); doc["course_id"] = f"course_{uuid.uuid4().hex[:8]}"
    await db.courses.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/courses/{course_id}")
async def edit_course(course_id: str, body: CourseIn, admin: dict = Depends(admin_user)):
    await db.courses.update_one({"course_id": course_id}, {"$set": body.model_dump()})
    return {"ok": True}

@api.delete("/admin/courses/{course_id}")
async def del_course(course_id: str, admin: dict = Depends(admin_user)):
    await db.courses.delete_one({"course_id": course_id}); return {"ok": True}

# Module CRUD
@api.post("/admin/modules")
async def create_module(body: ModuleIn, admin: dict = Depends(admin_user)):
    doc = body.model_dump(); doc["module_id"] = f"mod_{uuid.uuid4().hex[:8]}"
    await db.modules.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/modules/{module_id}")
async def edit_module(module_id: str, body: ModuleIn, admin: dict = Depends(admin_user)):
    await db.modules.update_one({"module_id": module_id}, {"$set": body.model_dump()}); return {"ok": True}

@api.delete("/admin/modules/{module_id}")
async def del_module(module_id: str, admin: dict = Depends(admin_user)):
    await db.modules.delete_one({"module_id": module_id})
    await db.lessons.delete_many({"module_id": module_id}); return {"ok": True}

# Lesson CRUD
@api.post("/admin/lessons")
async def create_lesson(body: LessonIn, admin: dict = Depends(admin_user)):
    doc = body.model_dump(); doc["lesson_id"] = f"les_{uuid.uuid4().hex[:8]}"
    await db.lessons.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/lessons/{lesson_id}")
async def edit_lesson(lesson_id: str, body: LessonIn, admin: dict = Depends(admin_user)):
    await db.lessons.update_one({"lesson_id": lesson_id}, {"$set": body.model_dump()}); return {"ok": True}

@api.delete("/admin/lessons/{lesson_id}")
async def del_lesson(lesson_id: str, admin: dict = Depends(admin_user)):
    await db.lessons.delete_one({"lesson_id": lesson_id}); return {"ok": True}

# Live session CRUD
@api.post("/admin/live-sessions")
async def create_live(body: LiveSessionIn, admin: dict = Depends(admin_user)):
    doc = body.model_dump(); doc["id"] = str(uuid.uuid4())
    await db.live_sessions.insert_one(doc); doc.pop("_id", None); return doc

@api.put("/admin/live-sessions/{sid}")
async def edit_live(sid: str, body: LiveSessionIn, admin: dict = Depends(admin_user)):
    await db.live_sessions.update_one({"id": sid}, {"$set": body.model_dump()}); return {"ok": True}

@api.delete("/admin/live-sessions/{sid}")
async def del_live(sid: str, admin: dict = Depends(admin_user)):
    await db.live_sessions.delete_one({"id": sid}); return {"ok": True}

# Testimonial CRUD
@api.post("/admin/testimonials")
async def create_test(body: TestimonialIn, admin: dict = Depends(admin_user)):
    doc = body.model_dump(); doc["id"] = str(uuid.uuid4())
    await db.testimonials.insert_one(doc); doc.pop("_id", None); return doc

@api.delete("/admin/testimonials/{tid}")
async def del_test(tid: str, admin: dict = Depends(admin_user)):
    await db.testimonials.delete_one({"id": tid}); return {"ok": True}

@api.get("/admin/contacts")
async def admin_contacts(admin: dict = Depends(admin_user)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ----------------- Seed -----------------
from seed import seed_all

@app.on_event("startup")
async def startup():
    await seed_all(db, hash_pw)

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
