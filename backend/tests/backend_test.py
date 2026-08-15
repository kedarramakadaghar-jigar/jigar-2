"""TradeAcademy backend API tests — payments + gating + admin plan mgmt."""
import os, uuid, pytest, requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

STUDENT = {"email": "student@demo.com", "password": "Demo1234"}
ADMIN = {"email": "admin@demo.com", "password": "Admin1234"}
ORIGIN = BASE_URL


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
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json=STUDENT, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and d["user"]["email"] == STUDENT["email"]

    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": STUDENT["email"], "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_includes_plan(self, student_token):
        r = requests.get(f"{API}/auth/me", headers=h(student_token), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == STUDENT["email"]
        assert "plan" in d, f"'plan' missing from /auth/me response: {d}"
        assert d["plan"] == "full", f"demo student should be plan 'full', got {d.get('plan')}"

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401


# ---------------- Courses ----------------
class TestCourses:
    def test_list_courses(self):
        r = requests.get(f"{API}/courses", timeout=15)
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_course_full(self):
        r = requests.get(f"{API}/courses/course_main/full", timeout=15)
        assert r.status_code == 200
        c = r.json()
        assert len(c["modules"]) >= 18


# ---------------- Lesson gating ----------------
class TestLessonGating:
    def test_free_lesson_no_auth(self):
        r = requests.get(f"{API}/lessons/les_01_1", timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("is_free") is True

    def test_paid_lesson_no_auth_401(self):
        r = requests.get(f"{API}/lessons/les_05_1", timeout=15)
        assert r.status_code == 401

    def test_paid_lesson_full_plan_ok(self, student_token):
        r = requests.get(f"{API}/lessons/les_05_1", headers=h(student_token), timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["lesson_id"] == "les_05_1"

    def test_paid_lesson_no_plan_student_403(self, admin_token):
        # create a no-plan student
        email = f"TEST_noplan_{uuid.uuid4().hex[:6]}@ex.com"
        cr = requests.post(f"{API}/admin/users", headers=h(admin_token),
                           json={"name": "NoPlan", "email": email,
                                 "password": "Passw0rd!", "role": "student"},
                           timeout=15)
        assert cr.status_code == 200, cr.text
        uid = cr.json()["user_id"]
        try:
            tk = requests.post(f"{API}/auth/login",
                               json={"email": email, "password": "Passw0rd!"},
                               timeout=15).json()["token"]
            r = requests.get(f"{API}/lessons/les_05_1", headers=h(tk), timeout=15)
            assert r.status_code == 403, r.text
        finally:
            requests.delete(f"{API}/admin/users/{uid}", headers=h(admin_token), timeout=15)


# ---------------- Payments ----------------
class TestPayments:
    def test_checkout_no_auth_401(self):
        r = requests.post(f"{API}/payments/checkout",
                          json={"package_id": "full_course", "origin_url": ORIGIN},
                          timeout=20)
        assert r.status_code == 401

    def test_checkout_invalid_package(self, student_token):
        r = requests.post(f"{API}/payments/checkout", headers=h(student_token),
                          json={"package_id": "not_a_pkg", "origin_url": ORIGIN},
                          timeout=20)
        assert r.status_code == 400

    def test_checkout_full_course_ok(self, student_token):
        r = requests.post(f"{API}/payments/checkout", headers=h(student_token),
                          json={"package_id": "full_course", "origin_url": ORIGIN},
                          timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("checkout_url", "").startswith("https://")
        assert d.get("session_id")
        # status endpoint returns pending
        sid = d["session_id"]
        s = requests.get(f"{API}/payments/status/{sid}",
                         headers=h(student_token), timeout=30)
        assert s.status_code == 200, s.text
        sd = s.json()
        assert sd["session_id"] == sid
        assert "status" in sd and "payment_status" in sd and "plan" in sd
        assert sd["payment_status"] in ("pending", "paid")
        assert sd["plan"] == "full"

    def test_checkout_premium_ok(self, student_token):
        r = requests.post(f"{API}/payments/checkout", headers=h(student_token),
                          json={"package_id": "premium", "origin_url": ORIGIN},
                          timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["checkout_url"].startswith("https://")

    def test_status_unknown_session_404(self, student_token):
        r = requests.get(f"{API}/payments/status/nonexistent_sess_id",
                         headers=h(student_token), timeout=15)
        assert r.status_code == 404


# ---------------- Admin plan mgmt ----------------
class TestAdminPlan:
    def test_admin_create_with_plan_and_set_plan(self, admin_token):
        email = f"TEST_plan_{uuid.uuid4().hex[:6]}@ex.com"
        r = requests.post(f"{API}/admin/users", headers=h(admin_token),
                          json={"name": "T", "email": email,
                                "password": "Passw0rd!", "role": "student",
                                "plan": "full"}, timeout=15)
        assert r.status_code == 200, r.text
        u = r.json()
        assert u["plan"] == "full"
        uid = u["user_id"]

        # PUT plan -> premium
        r = requests.put(f"{API}/admin/users/{uid}/plan", headers=h(admin_token),
                         json={"plan": "premium"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["plan"] == "premium"

        # PUT plan clear (None)
        r = requests.put(f"{API}/admin/users/{uid}/plan", headers=h(admin_token),
                         json={"plan": None}, timeout=15)
        assert r.status_code == 200
        assert r.json()["plan"] is None

        # PUT invalid plan
        r = requests.put(f"{API}/admin/users/{uid}/plan", headers=h(admin_token),
                         json={"plan": "gold"}, timeout=15)
        assert r.status_code == 400

        # cleanup
        requests.delete(f"{API}/admin/users/{uid}", headers=h(admin_token), timeout=15)

    def test_set_plan_forbidden_for_student(self, student_token, admin_token):
        # get some user id
        users = requests.get(f"{API}/admin/users", headers=h(admin_token), timeout=15).json()
        uid = users[0]["user_id"]
        r = requests.put(f"{API}/admin/users/{uid}/plan", headers=h(student_token),
                         json={"plan": "full"}, timeout=15)
        assert r.status_code == 403
