# Waitlist

A restaurant waitlist management application for hosts and staff to manage customer queues and table flow.

## Overview

Waitlist helps restaurant staff efficiently manage their waitlist, track parties, and streamline the seating process. The application is designed for host/staff use at the restaurant.

## Features

### Customer Join Methods

Customers can join the waitlist through multiple channels:

- **Host Stand Entry** — Staff manually adds walk-in customers
- **Self Check-in** — QR code or kiosk-based self-registration
- **Remote Join** — Customers join via app/web before arriving

### Host-Facing Capabilities (Planned)

- View and manage the waitlist queue
- Drag and reorder parties
- Assign tables to parties
- Estimated wait time display
- Update party status (waiting, notified, seated, removed)

## Tech Stack

- **Frontend**: Prototype-first approach (framework TBD)
- **Backend**: TBD (see Open Questions)

## Project Status

This project is in the early specification phase. A frontend prototype will be built first.

## Open Questions

The following decisions are pending:

1. **Backend Stack** — Node.js (Express/Fastify), Python (FastAPI/Django), or other?
2. **Customer Notifications** — SMS, push notifications, both, or staff calls name for v1?
3. **Multi-tenancy** — Single restaurant, multi-restaurant SaaS, or multi-location chain?

## License

TBD
