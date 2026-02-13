from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_register_and_login():
    email = "testuser@example.com"
    password = "test12345"
    r = client.post("/auth/register", json={"email": email, "password": password, "name": "Test"})
    assert r.status_code in [200, 400]

    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_create_order_flow():
    login = client.post("/auth/login", json={"email": "demo@restaurant.app", "password": "demo1234"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    menu = client.get("/menu-items", headers=headers)
    item_id = menu.json()[0]["id"]

    order = client.post(
        "/orders",
        headers=headers,
        json={
            "mode": "delivery",
            "items": [{"menu_item_id": item_id, "quantity": 2, "selected_options": ""}],
            "note": "No onions",
        },
    )
    assert order.status_code == 200
    assert order.json()["status"] == "Placed"
