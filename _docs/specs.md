# Waitlist — App Specifications

## Overview
A restaurant waitlist management application. Name: **Waitlist**.

## Users
- Primary users: **Restaurant host/staff only** (staff manage the waitlist and table flow).

## Customer Join Methods
Customers can join the waitlist through **all of the following**:
- Staff enters them manually at the host stand
- Self check-in via QR code / kiosk
- Remote join via app/web before arriving

## Platform (Build Order)
- Start with a **Frontend prototype** first.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS (see `frontend/`)
- **Backend**: Python, FastAPI (see `backend/`)
- **Database**: SQLite for local development, accessed via SQLAlchemy (database-agnostic — see `backend/README.md#database`)

## Next Steps
- Data model, core API endpoints, and host-facing features are implemented — see `_docs/openapi.yaml`, `backend/`, and `frontend/`.
- Decide on customer notifications (SMS, push notification, both, or none for v1 — staff calls name).
- Decide on multi-tenancy (single restaurant, multi-restaurant SaaS, multi-location chain).
- Add authentication/authorization for host/staff users (none yet).
- Decide on a deployment target and production database.
