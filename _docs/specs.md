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

## Open Questions (need answers to finalize spec)
1. **Backend stack** — Node.js (Express/Fastify), Python (FastAPI/Django), other, or recommend one?
2. **Customer notifications** — SMS, push notification, both, or none for v1 (staff calls name)?
3. **Multi-tenancy** — single restaurant only, multi-restaurant SaaS, multi-location chain, or undecided?

## Next Steps
- Answer the open questions above.
- Define data model (waitlist entries, tables, parties, statuses).
- Define core API endpoints (add to waitlist, update status, notify, remove/seat).
- Define host-facing features (drag/reorder queue, estimated wait time, table assignment).
