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
