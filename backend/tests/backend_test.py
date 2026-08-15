"""TradeAcademy backend API tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://market-mastery-93.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

STUDENT = {"email": "student@demo.com", "password": "Demo1234"}
ADMIN = {"email": "admin@demo.com", "password": "Admin1234"}


@pytest.fixture(scope="session")
def student_token():
    r = requests.post(f"{API}/auth/login", json=STUDENT, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json=ADMIN, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


def h(tok): return {"Authorization": f"Bearer {tok}"}


# ---------------- Auth ----------------
class TestAuth:
    def test_register_success(self):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "Test User", "email": email,
            "password": "Passw0rd!", "confirm_password": "Passw0rd!"
        }, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "token" in d and d["user"]["email"] == email.lower()
        assert d["user"]["role"] == "student"

    def test_register_password_mismatch(self):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "name": "X", "email": email,
            "password": "Passw0rd!", "confirm_password": "Different1"
        }, timeout=15)
        assert r.status_code == 400

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "name": "Dup", "email": STUDENT["email"],
            "password": "Passw0rd!", "confirm_password": "Passw0rd!"
        }, timeout=15)
        assert r.status_code == 400

    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json=STUDENT, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d
        assert d["user"]["email"] == STUDENT["email"]

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": STUDENT["email"], "password": "wrong"
        }, timeout=15)
        assert r.status_code == 401

    def test_me_with_token(self, student_token):
        r = requests.get(f"{API}/auth/me", headers=h(student_token), timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == STUDENT["email"]

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_forgot_password_generic(self):
        r = requests.post(f"{API}/auth/forgot-password",
                          json={"email": "anyone@nowhere.com"}, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------------- Courses ----------------
class TestCourses:
    def test_list_courses(self):
        r = requests.get(f"{API}/courses", timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1

    def test_course_full_18_modules(self):
        r = requests.get(f"{API}/courses/course_main/full", timeout=15)
        assert r.status_code == 200
        c = r.json()
        assert "modules" in c
        assert len(c["modules"]) == 18, f"Expected 18 modules, got {len(c['modules'])}"
        # every module must have lessons
        total_lessons = 0
        for m in c["modules"]:
            assert m.get("lessons"), f"module {m.get('title')} has no lessons"
            total_lessons += len(m["lessons"])
        assert total_lessons >= 18

    def test_course_not_found(self):
        r = requests.get(f"{API}/courses/does_not_exist/full", timeout=15)
        assert r.status_code == 404


# ---------------- Progress ----------------
class TestProgress:
    def test_progress_flow(self, student_token):
        # Get first lesson id
        full = requests.get(f"{API}/courses/course_main/full", timeout=15).json()
        lesson_id = full["modules"][0]["lessons"][0]["lesson_id"]

        # Baseline
        r0 = requests.get(f"{API}/progress", headers=h(student_token), timeout=15).json()
        assert "total_lessons" in r0 and "percentage" in r0

        # Complete
        r = requests.post(f"{API}/progress/complete",
                         headers=h(student_token),
                         json={"lesson_id": lesson_id}, timeout=15)
        assert r.status_code == 200

        r1 = requests.get(f"{API}/progress", headers=h(student_token), timeout=15).json()
        assert lesson_id in r1["completed_ids"]

        # Uncomplete
        r = requests.post(f"{API}/progress/uncomplete",
                         headers=h(student_token),
                         json={"lesson_id": lesson_id}, timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/progress", headers=h(student_token), timeout=15).json()
        assert lesson_id not in r2["completed_ids"]

    def test_progress_unauth(self):
        r = requests.get(f"{API}/progress", timeout=15)
        assert r.status_code == 401


# ---------------- Public data & Contact ----------------
class TestPublic:
    def test_live_sessions(self):
        r = requests.get(f"{API}/live-sessions", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_testimonials(self):
        r = requests.get(f"{API}/testimonials", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_contact(self):
        r = requests.post(f"{API}/contact", json={
            "name": "TEST_Contact", "email": "t@t.com",
            "subject": "hi", "message": "hello"
        }, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------------- Admin RBAC ----------------
class TestAdmin:
    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=h(admin_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["modules"] >= 18
        assert d["lessons"] >= 18

    def test_admin_stats_forbidden_for_student(self, student_token):
        r = requests.get(f"{API}/admin/stats", headers=h(student_token), timeout=15)
        assert r.status_code == 403

    def test_admin_users(self, admin_token):
        r = requests.get(f"{API}/admin/users", headers=h(admin_token), timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert any(u["email"] == STUDENT["email"] for u in arr)
        # progress field present
        assert "progress" in arr[0]

    def test_admin_contacts(self, admin_token):
        r = requests.get(f"{API}/admin/contacts", headers=h(admin_token), timeout=15)
        assert r.status_code == 200

    def test_admin_module_lesson_live_crud(self, admin_token):
        # create module
        r = requests.post(f"{API}/admin/modules",
                          headers=h(admin_token),
                          json={"course_id": "course_main",
                                "title": "TEST_Module", "description": "d",
                                "order": 999, "is_free": True}, timeout=15)
        assert r.status_code == 200, r.text
        mid = r.json()["module_id"]

        # create lesson
        r = requests.post(f"{API}/admin/lessons",
                          headers=h(admin_token),
                          json={"module_id": mid, "title": "TEST_Lesson",
                                "description": "d", "objectives": ["a"],
                                "video_url": "https://youtube.com/x",
                                "duration": "5 min", "order": 1, "is_free": True},
                          timeout=15)
        assert r.status_code == 200, r.text
        lid = r.json()["lesson_id"]

        # edit lesson
        r = requests.put(f"{API}/admin/lessons/{lid}",
                         headers=h(admin_token),
                         json={"module_id": mid, "title": "TEST_Lesson_Upd",
                               "description": "u", "objectives": [],
                               "video_url": "", "duration": "6 min",
                               "order": 1, "is_free": True}, timeout=15)
        assert r.status_code == 200

        # verify via GET lesson
        g = requests.get(f"{API}/lessons/{lid}", timeout=15).json()
        assert g["title"] == "TEST_Lesson_Upd"

        # create live session
        r = requests.post(f"{API}/admin/live-sessions",
                          headers=h(admin_token),
                          json={"topic": "TEST_Live", "description": "d",
                                "date": "2026-02-01", "time": "18:00",
                                "instructor": "A", "join_url": "",
                                "level": "Beginner"}, timeout=15)
        assert r.status_code == 200
        sid = r.json()["id"]
        r = requests.put(f"{API}/admin/live-sessions/{sid}",
                         headers=h(admin_token),
                         json={"topic": "TEST_Live_Upd", "description": "d",
                               "date": "2026-02-02", "time": "19:00",
                               "instructor": "A", "join_url": "",
                               "level": "Beginner"}, timeout=15)
        assert r.status_code == 200
        r = requests.delete(f"{API}/admin/live-sessions/{sid}",
                            headers=h(admin_token), timeout=15)
        assert r.status_code == 200

        # cleanup - delete module cascades lessons
        r = requests.delete(f"{API}/admin/modules/{mid}",
                            headers=h(admin_token), timeout=15)
        assert r.status_code == 200
        # verify lesson gone
        g = requests.get(f"{API}/lessons/{lid}", timeout=15)
        assert g.status_code == 404

    def test_admin_module_forbidden_for_student(self, student_token):
        r = requests.post(f"{API}/admin/modules",
                          headers=h(student_token),
                          json={"course_id": "course_main", "title": "x",
                                "description": "", "order": 0, "is_free": True},
                          timeout=15)
        assert r.status_code == 403
