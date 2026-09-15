"""Tests for /api/parties endpoints, written against openapi.yaml before
the routes exist. Run with `uv run pytest` from backend/.
"""


def test_list_parties_returns_seed_data(client):
    res = client.get("/api/parties")
    assert res.status_code == 200
    parties = res.json()
    assert len(parties) == 3
    names = {p["name"] for p in parties}
    assert names == {"Garcia", "Chen", "Patel"}
    garcia = next(p for p in parties if p["name"] == "Garcia")
    assert garcia["status"] == "waiting"
    assert garcia["source"] == "host"
    assert garcia["partySize"] == 2
    assert garcia["position"] == 0
    assert "quotedWaitMinutes" in garcia
    assert "createdAt" in garcia


def test_add_party_creates_waiting_party(client):
    res = client.post(
        "/api/parties",
        json={"name": "Novak", "phone": "555-0199", "partySize": 2, "source": "host"},
    )
    assert res.status_code == 201
    party = res.json()
    assert party["name"] == "Novak"
    assert party["phone"] == "555-0199"
    assert party["partySize"] == 2
    assert party["status"] == "waiting"
    assert party["source"] == "host"
    assert party["notes"] is None
    assert party["tableId"] is None
    assert party["quotedWaitMinutes"] > 0
    assert isinstance(party["id"], str) and party["id"]

    listed = client.get("/api/parties").json()
    assert any(p["id"] == party["id"] for p in listed)


def test_add_party_accepts_optional_notes(client):
    res = client.post(
        "/api/parties",
        json={
            "name": "Kaur",
            "phone": "555-0111",
            "partySize": 5,
            "source": "kiosk",
            "notes": "high chair needed",
        },
    )
    assert res.status_code == 201
    assert res.json()["notes"] == "high chair needed"


def test_add_party_assigns_incrementing_positions(client):
    first = client.post(
        "/api/parties", json={"name": "A", "phone": "1", "partySize": 1, "source": "remote"}
    ).json()
    second = client.post(
        "/api/parties", json={"name": "B", "phone": "2", "partySize": 1, "source": "remote"}
    ).json()
    assert second["position"] > first["position"]


def test_add_party_missing_required_field_is_rejected(client):
    res = client.post("/api/parties", json={"phone": "555-0199", "partySize": 2, "source": "host"})
    assert res.status_code == 422


def test_add_party_invalid_source_is_rejected(client):
    res = client.post(
        "/api/parties",
        json={"name": "Novak", "phone": "555-0199", "partySize": 2, "source": "carrier-pigeon"},
    )
    assert res.status_code == 422


def test_notify_party_sets_status_notified(client):
    party_id = client.get("/api/parties").json()[0]["id"]
    res = client.post(f"/api/parties/{party_id}/notify")
    assert res.status_code == 200
    assert res.json()["status"] == "notified"


def test_notify_unknown_party_returns_404(client):
    res = client.post("/api/parties/does-not-exist/notify")
    assert res.status_code == 404


def test_seat_party_marks_party_and_table(client):
    party_id = client.get("/api/parties").json()[0]["id"]
    table_id = client.get("/api/tables").json()[0]["id"]

    res = client.post(f"/api/parties/{party_id}/seat", json={"tableId": table_id})
    assert res.status_code == 200
    party = res.json()
    assert party["status"] == "seated"
    assert party["tableId"] == table_id

    table = next(t for t in client.get("/api/tables").json() if t["id"] == table_id)
    assert table["status"] == "occupied"
    assert table["partyId"] == party_id


def test_seat_party_unknown_party_returns_404(client):
    table_id = client.get("/api/tables").json()[0]["id"]
    res = client.post("/api/parties/does-not-exist/seat", json={"tableId": table_id})
    assert res.status_code == 404


def test_seat_party_unknown_table_returns_404(client):
    party_id = client.get("/api/parties").json()[0]["id"]
    res = client.post(f"/api/parties/{party_id}/seat", json={"tableId": "no-such-table"})
    assert res.status_code == 404


def test_seat_party_already_occupied_table_returns_409(client):
    parties = client.get("/api/parties").json()
    table_id = client.get("/api/tables").json()[0]["id"]
    client.post(f"/api/parties/{parties[0]['id']}/seat", json={"tableId": table_id})

    res = client.post(f"/api/parties/{parties[1]['id']}/seat", json={"tableId": table_id})
    assert res.status_code == 409


def test_remove_party_sets_status_removed(client):
    party_id = client.get("/api/parties").json()[0]["id"]
    res = client.post(f"/api/parties/{party_id}/remove")
    assert res.status_code == 200
    assert res.json()["status"] == "removed"


def test_remove_unknown_party_returns_404(client):
    res = client.post("/api/parties/does-not-exist/remove")
    assert res.status_code == 404


def test_reorder_queue_updates_positions(client):
    parties = client.get("/api/parties").json()
    ids = [p["id"] for p in parties]
    reversed_ids = list(reversed(ids))

    res = client.post("/api/parties/reorder", json={"orderedIds": reversed_ids})
    assert res.status_code == 200
    by_id = {p["id"]: p["position"] for p in res.json()}
    for index, party_id in enumerate(reversed_ids):
        assert by_id[party_id] == index


def test_reorder_queue_unknown_id_returns_404(client):
    res = client.post("/api/parties/reorder", json={"orderedIds": ["nope"]})
    assert res.status_code == 404


def test_estimate_wait_scales_with_party_size(client):
    small = client.get("/api/parties/estimate-wait", params={"partySize": 2}).json()["minutes"]
    large = client.get("/api/parties/estimate-wait", params={"partySize": 6}).json()["minutes"]
    assert large > small


def test_estimate_wait_scales_with_current_queue(client):
    before = client.get("/api/parties/estimate-wait", params={"partySize": 2}).json()["minutes"]
    client.post("/api/parties", json={"name": "Extra", "phone": "1", "partySize": 2, "source": "kiosk"})
    after = client.get("/api/parties/estimate-wait", params={"partySize": 2}).json()["minutes"]
    assert after > before


def test_estimate_wait_missing_party_size_returns_422(client):
    res = client.get("/api/parties/estimate-wait")
    assert res.status_code == 422
