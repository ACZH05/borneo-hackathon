# BorNEO AI: Community Resilience

BorNEO AI is a disaster preparedness and emergency response web platform built for communities across Borneo and nearby Southeast Asian regions. It connects residents, responders, and administrators through one shared system for medical identity, localized alerts, preparedness education, and SOS coordination.

The project focuses on a practical problem: during floods, landslides, and other regional emergencies, field teams lose valuable time identifying victims, locating households, and understanding medical risk. BorNEO AI reduces that delay by combining role-based workflows, geospatial mapping, rescue-card data, and AI-assisted decision support.

## Executive Summary

BorNEO AI is structured around three operational outcomes:

1. Residents prepare before a crisis through simulations, checklists, and profile-based emergency planning.
2. Communities stay informed during a crisis through centralized alerts and map-based situational awareness.
3. Responders act faster during rescue operations through SOS triage, medical rescue cards, location data, and scannable QR codes.

The application uses role-based routing so the interface changes depending on whether the user is a resident or an administrator. Residents see preparedness resources, alerts, and profile tools. Administrators get access to alert broadcasting and SOS dispatch workflows.

## Who It Is For

### Primary users

- Residents in flood-, landslide-, or storm-prone communities
- Families caring for elderly people, children, or people with medical vulnerabilities
- Local emergency coordinators and municipal administrators
- First responders and field medics who need rapid access to victim data

### Typical use cases

- A resident creates a medical rescue card with blood type, allergies, emergency contacts, and home coordinates.
- A household generates an AI-assisted emergency checklist tailored to hazard type, family size, pets, and special needs.
- An administrator drafts and publishes multilingual alerts for a specific region.
- A resident sends an SOS report that is automatically geocoded and triaged for urgency.
- A responder scans a QR code to retrieve essential medical and contact data during a rescue.

## Core Pillars

### 1. Proactive Preparedness and Education

Preparedness is handled through a resident-facing resources hub designed to make action easy before conditions deteriorate.

Implemented in this project:

- Interactive hazard simulations powered by Gemini via `/api/ai/quiz`
- AI-generated emergency action plans and editable checklists via `/api/ai/generate-plan`
- Checklist history and persistence via `/api/checklist`
- A dedicated resources section with simulation and checklist entry points

### 2. Role-Based Rapid Response and Triage

The platform separates resident and administrator experiences so high-stress users only see the tools relevant to their role.

Implemented in this project:

- Resident navigation for home, alerts, resources, and profile
- Admin routing for SOS monitoring, alert management, and responder workflows
- SOS report submission with AI-assisted triage via `/api/reports`
- Admin alert creation and broadcast via `/api/alert`

### 3. Centralized Medical Identity and Intelligent Mapping

BorNEO AI treats the rescue card as the operational center of a resident profile.

Implemented in this project:

- Medical rescue card storage with blood type, allergies, medical conditions, and emergency contacts
- Home coordinate capture with map-based fine-tuning
- Forward and reverse geocoding through Google Maps APIs
- QR code generation for field retrieval
- Shareable map URL generation for household location context

## Feature Overview

### Resident experience

- Magic-link authentication using Supabase
- Dashboard with latest alerts, platform status, trusted contacts, and location map
- Profile management with editable identity, region, and rescue-card details
- Medical rescue card with emergency QR code
- Active alerts view with list and map modes
- Resource center for simulations and personalized checklists

### Administrator experience

- Dedicated admin routes and role-gated alert creation
- SOS queue for incoming incident reports
- AI triage metadata attached to reports, including severity, tags, actions, and suggested assets
- Alert broadcasting with region, severity, hazard type, and mapped coordinates
- Draft-alert generation using Gemini for cleaner public communication

### AI-assisted workflows

- `draft-alert`: turns rough hazard notes into a structured multilingual broadcast
- `generate-plan`: creates a personalized emergency checklist and saves it to PostgreSQL
- `quiz`: generates localized survival scenarios with correct and misleading choices for preparedness training
- `reports`: classifies inbound SOS reports to help responders prioritize dispatch

## Product Flow

### Resident flow

1. Log in using a Supabase magic link.
2. Complete the profile and assign a region.
3. Add rescue-card data and home location.
4. Use simulations and AI-generated checklists to prepare.
5. Monitor alerts from the resident dashboard.
6. Submit an SOS report if an incident occurs.

### Responder and admin flow

1. Access the admin workspace.
2. Review incoming SOS requests and triage details.
3. Open resident rescue-card information when needed.
4. Create or refine regional alerts.
5. Coordinate response with location and medical context already attached.

## Tech Stack

### Frontend

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- MUI and Google Material Symbols
- `@vis.gl/react-google-maps` for map rendering

### Backend and data

- Next.js Route Handlers for server APIs
- PostgreSQL as the primary relational database
- Prisma ORM with `@prisma/adapter-pg`
- Supabase Auth for passwordless login and session bootstrap

### External services

- Google Maps Geocoding API
- Google Maps JavaScript API
- Gemini via `@google/generative-ai`
- QR code generation with `qrcode`

## Data Model

The Prisma schema currently includes these core entities:

- `User`: account identity, role, region, and relationships
- `RescueCard`: medical data, contact info, home coordinates, address, QR code, and shareable URL
- `IncidentReport`: SOS report, hazard, location, address, and AI triage payload
- `Alert`: broadcast metadata including severity, hazard type, text body, and optional coordinates
- `EmergencyPlan`: AI-generated checklist plans stored as JSON

## Key Routes

### App routes

- `/` resident home dashboard
- `/page-alerts` active alert feed
- `/page-profile` resident identity and rescue-card management
- `/page-resources` preparedness resources hub
- `/page-resources/page-resources-simulation` interactive hazard simulation
- `/page-resources/page-resources-checklist` checklist generator and history
- `/admin/sos` responder SOS queue

### API routes

- `/api/auth/sync` syncs authenticated Supabase users into Prisma
- `/api/user/[id]` reads and updates user profile data
- `/api/rescue-card` creates or fetches rescue-card records
- `/api/geocode` resolves an address into coordinates
- `/api/reverse-geocode` resolves coordinates into a readable address
- `/api/reports` stores SOS reports and AI triage output
- `/api/alert` creates and lists broadcast alerts
- `/api/checklist` reads checklist history
- `/api/checklist/[id]` updates checklist completion state
- `/api/ai/draft-alert` generates structured alert copy
- `/api/ai/generate-plan` generates personalized emergency plans
- `/api/ai/quiz` generates localized preparedness scenarios

## Environment Variables

Create a `.env` file in the project root and configure the following:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY=
GEMINI_API_KEY=
```

### Notes

- `GOOGLE_MAPS_API_KEY` is used by server-side geocoding and reverse-geocoding routes.
- `NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY` is used by the client-side map components.
- `DATABASE_URL` is required by Prisma and the PostgreSQL adapter.
- Supabase values are required for magic-link login and session-based user sync.

## Local Development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database
- Supabase project
- Google Maps API access
- Gemini API key

### Setup

```bash
npm install
```

Create `.env` with the variables listed above, then initialize Prisma:

```bash
npx prisma db push
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Recommended Demo Walkthrough

For hackathon demos or stakeholder reviews, this sequence shows the product well:

1. Sign in as a resident with magic-link auth.
2. Open the profile page and create a medical rescue card.
3. Show address lookup, map pinning, and QR generation.
4. Generate a personalized checklist from the resources section.
5. Open the alerts feed and switch between list and map modes.
6. Submit or present an SOS example and show the admin triage view.
7. Demonstrate AI-assisted alert drafting for administrators.

## Current Strengths

- Clear resident versus admin separation
- Good alignment between product concept and implemented data model
- End-to-end rescue-card workflow from input to QR output
- AI augmentation attached to real user workflows instead of isolated demos
- Strong fit for regional hazard preparedness and localized response scenarios

## Future Improvements

- Offline-first rescue-card access and cached alert history
- Push notifications and SMS escalation
- Multi-language UI selection
- Stronger responder dispatch tooling and assignment tracking
- Audit logs and admin activity controls
- Richer analytics for hazard trends and preparedness coverage

## Repository Structure

```text
src/app/
  admin/                  admin SOS workflows
  api/                    server route handlers
  components/             shared UI
  page-alerts/            resident alert experience
  page-profile/           resident profile and rescue card
  page-resources/         education, simulation, checklist flows
prisma/
  schema.prisma           database schema
```

## Summary

BorNEO AI is not just an information portal. It is a role-aware resilience platform that helps communities prepare earlier, respond faster, and give responders better context when time is critical. The current implementation already covers the most important operational loop: identify the resident, locate the household, understand medical risk, and support decisions with alerts, mapping, and AI-generated guidance.
