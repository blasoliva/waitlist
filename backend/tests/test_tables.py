"""Tests for /api/tables endpoints, written against openapi.yaml before
the routes exist. Run with `uv run pytest` from backend/.
"""


def test_list_tables_returns_seed_data(client):
    res = client.get("/api/tables")
    assert res.status_code == 200
    tables = res.json()
    assert len(tables) == 6
    labels = {t["label"] for t in tables}
    assert labels == {"T1", "T2", "T3", "T4", "T5", "T6"}
    for table in tables:
        assert table["status"] == "available"
        assert table["partyId"] is None


def test_free_table_marks_it_available(client):
    party_id = client.get("/api/parties").json()[0]["id"]
    table_id = client.get("/api/tables").json()[0]["id"]
    client.post(f"/api/parties/{party_id}/seat", json={"tableId": table_id})

    res = client.post(f"/api/tables/{table_id}/free")
    assert res.status_code == 200
    table = res.json()
    assert table["status"] == "available"
    assert table["partyId"] is None


def test_free_unknown_table_returns_404(client):
    res = client.post("/api/tables/does-not-exist/free")
    assert res.status_code == 404


def test_tables_are_returned_in_label_order(client):
    labels = [t["label"] for t in client.get("/api/tables").json()]
    assert labels == sorted(labels)


def test_table_can_be_reseated_after_freeing(client):
    parties = client.get("/api/parties").json()
    table_id = client.get("/api/tables").json()[0]["id"]

    first_party, second_party = parties[0], parties[1]
    client.post(f"/api/parties/{first_party['id']}/seat", json={"tableId": table_id})
    client.post(f"/api/tables/{table_id}/free")

    res = client.post(f"/api/parties/{second_party['id']}/seat", json={"tableId": table_id})
    assert res.status_code == 200

    table = next(t for t in client.get("/api/tables").json() if t["id"] == table_id)
    assert table["status"] == "occupied"
    assert table["partyId"] == second_party["id"]

    # The table's current occupant moved on, but the first party keeps its
    # historical table assignment — freeing a table never rewrites the past.
    first_party_after = next(p for p in client.get("/api/parties").json() if p["id"] == first_party["id"])
    assert first_party_after["tableId"] == table_id
    assert first_party_after["status"] == "seated"
