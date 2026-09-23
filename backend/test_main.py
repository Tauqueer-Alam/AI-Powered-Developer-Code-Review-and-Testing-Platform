import os
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

test_db_handle, test_db_name = tempfile.mkstemp(prefix="codelens-test-", suffix=".db")
os.close(test_db_handle)
TEST_DB_PATH = Path(test_db_name)
TEST_DB_PATH.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH.as_posix()}"
os.environ["ENABLE_CODE_EXECUTION"] = "true"

from backend.main import app, init_db

init_db()

client = TestClient(app)


def test_run_code_endpoint():
    response = client.post(
        "/api/run",
        json={"code": "print(2 + 3)"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["output"] == "5\n"
    assert payload["timed_out"] is False


def test_review_falls_back_when_ai_missing():
    response = client.post(
        "/api/review",
        json={
            "code": "def find_max(numbers):\n    max_value = 0\n    for number in numbers:\n        if number > max_value:\n            max_value = number\n    return max_value",
            "language": "python",
            "instructions": "Explain the important problems like I am a beginner.",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "Summary" in payload["review"]
    assert "Bugs and risks" in payload["review"]


def test_review_script_without_function_is_accurate():
    response = client.post(
        "/api/review",
        json={
            "code": "a = 5\nb = 3\nprint(a, b)\na, b = b, a\nprint(b, a)",
            "language": "python",
            "instructions": "Explain the important problems like I am a beginner.",
        },
    )

    assert response.status_code == 200
    review = response.json()["review"]
    assert "swaps" in review.lower()
    assert "o(1)" in review.lower()
    assert "empty list" not in review.lower()


def test_auth_register_and_login():
    email = "demo@example.com"
    password = "Secret123!"

    register = client.post(
        "/api/auth/register",
        json={"name": "Demo User", "email": email, "password": password},
    )
    assert register.status_code == 200
    register_payload = register.json()
    assert register_payload["user"]["email"] == email
    assert "token" in register_payload

    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login.status_code == 200
    assert login.json()["user"]["email"] == email


def test_generate_test_cases_for_function():
    response = client.post(
        "/api/generate-tests",
        json={
            "code": "def find_max(numbers):\n    if not numbers:\n        raise ValueError('empty list')\n    max_value = numbers[0]\n    for number in numbers[1:]:\n        if number > max_value:\n            max_value = number\n    return max_value",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "test" in payload["tests"].lower()
    assert "find_max" in payload["tests"]


def test_generate_tests_does_not_fabricate_function_for_script():
    response = client.post(
        "/api/generate-tests",
        json={"code": "a = 5\nb = 3\nprint(a, b)", "language": "python"},
    )

    assert response.status_code == 200
    assert "No function definition" in response.json()["tests"]


def test_explain_code_endpoint():
    response = client.post(
        "/api/explain-code",
        json={
            "code": "def add(a, b):\n    return a + b",
            "level": "beginner",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "add" in payload["explanation"].lower()
    assert "what" in payload["explanation"].lower()


def test_explain_script_without_function():
    response = client.post(
        "/api/explain-code",
        json={
            "code": "a = 5\nb = 3\nprint(a, b)\na, b = b, a\nprint(b, a)",
            "level": "beginner",
            "language": "python",
        },
    )

    assert response.status_code == 200
    explanation = response.json()["explanation"]
    assert "does not define a function" in explanation.lower()
    assert "swap" in explanation.lower()


def test_generate_factorial_tests():
    response = client.post(
        "/api/generate-tests",
        json={
            "code": "def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "factorial(5)" in payload["tests"]
    assert "assert result == 120" in payload["tests"]
    assert "factorial([" not in payload["tests"]


def test_bug_verification_endpoint():
    response = client.post(
        "/api/bug-verification",
        json={
            "code": "def find_max(numbers):\n    max_value = 0\n    for number in numbers:\n        if number > max_value:\n            max_value = number\n    return max_value",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "bug" in payload["summary"].lower() or "issue" in payload["summary"].lower()
    assert "verification" in payload["verification"].lower()


def test_static_analysis_endpoint():
    response = client.post(
        "/api/static-analysis",
        json={
            "code": "def check_even(value):\n    if value % 2 == 0:\n        return True\n    return False",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "issue" in payload["summary"].lower() or "analysis" in payload["summary"].lower()
    assert "static" in payload["analysis"].lower()


def test_complexity_analysis_endpoint():
    response = client.post(
        "/api/complexity-analysis",
        json={
            "code": "def contains_duplicate(items):\n    seen = set()\n    for item in items:\n        if item in seen:\n            return True\n        seen.add(item)\n    return False",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "O" in payload["complexity"] or "time" in payload["complexity"].lower()


def test_optimization_endpoint():
    response = client.post(
        "/api/optimize-code",
        json={
            "code": "def total(nums):\n    result = 0\n    for n in nums:\n        result += n\n    return result",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "optimization" in payload["suggestion"].lower() or "improvement" in payload["suggestion"].lower()


def test_quality_score_endpoint():
    response = client.post(
        "/api/quality-score",
        json={
            "code": "def add(a, b):\n    return a + b",
            "language": "python",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert 0 <= payload["score"] <= 100
    assert "quality" in payload["summary"].lower()
