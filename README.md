# BorNEO AI

BorNEO AI is a role-based disaster preparedness and emergency response platform for Borneo communities. The app separates resident and administrator workflows so each user sees only the tools they need during preparedness, alert monitoring, and emergency response.

## What The App Does

- Helps residents prepare with AI-powered simulations and personalized emergency checklists.
- Gives residents a rescue card with medical details, emergency contacts, home location, and QR code access.
- Lets residents send SOS reports with live GPS coordinates and hazard details.
- Gives administrators a triage workspace for SOS requests and a review queue for AI-generated alert drafts.

## Role Views

### Resident view

- Resident navigation includes `Home`, `Alerts`, `Resources`, and `Profile`.
- Global search can jump to the dashboard, alerts, resources, simulation, checklist, and profile pages.
- Residents can log in with a Supabase magic link.
- Residents can trigger SOS reports, view published alerts, generate checklists, run simulations, and manage their rescue card.

### Admin view

- Admin navigation includes `SOS`, `Alerts`, and `Profile`.
- Admin routes are protected by a role check and redirect non-admin users away from `/admin/*`.
- Global search switches to admin-specific items like the SOS dashboard, AI alert drafts, and admin profile.
- Admins can review incoming SOS cases, inspect rescue-card data, and approve AI-generated weather alert drafts for publication.

## Shared Shell Features

- Sticky header with role-aware navigation.
- Mobile drawer navigation and desktop nav pills.
- Search bar with contextual route suggestions.
- Magic-link login modal and logout button.
- Shared footer and loading states.

## Resident Pages

### `/` Home

- Hero dashboard for the resident experience.
- Browser geolocation request to center the map on the user.
- Live map panel showing the current location area.
- `SOS` button that opens an emergency modal.
- SOS modal includes hazard selection, optional incident description, GPS capture, submission feedback, and error handling.
- Quick-access emergency details card.
- Emergency details modal showing name, blood type, allergies, medical conditions, emergency contact, phone, home address, and QR code.
- Latest alerts section that highlights the top active alerts.
- Featured alert cards support deep-link navigation into the alerts page.
- Platform status card shows current alert level, active incidents, and last update time.
- Trusted contacts list includes click-to-call emergency numbers.

### `/page-alerts` Alerts

- Dedicated active alert dashboard.
- Toggle between `List` view and `Map` view.
- Hazard filters for `All Threats`, `Flood`, `Landslide`, `Tidal`, and `Other`.
- List cards for active alerts with severity styling and location context.
- Map mode for viewing alert locations visually.
- Clicking a list item can focus the map.
- Clicking a map pin can jump back to the related list item.
- URL query support for opening the page and auto-scrolling to a selected alert.

### `/page-resources` Resources Hub

- Preparedness landing page for low-bandwidth tools.
- Card entry point for the AI Survival Simulator.
- Card entry point for Smart Emergency Checklists.

### `/page-resources/page-resources-simulation` AI Survival Simulator

- Hazard selection for `Flood`, `Landslide`, and `Tidal`.
- Scenario descriptions before starting the simulation.
- Start button becomes active only after hazard selection.
- AI-generated emergency scenario fetched from `/api/ai/quiz`.
- Multiple-choice response flow with one selected answer.
- Correct and incorrect answer feedback after submission.
- Explanation panel describing the best action.
- Restart flow to generate another scenario.
- Loading and error states for quiz generation.

### `/page-resources/page-resources-checklist` Smart Emergency Checklists

- Auth-aware access that requires the user to be logged in.
- Responsive side drawer with an introduction view, a create-new-checklist action, and checklist history.
- Introduction panel explaining the 3-step checklist workflow.
- Checklist generator form with preset or custom hazard type, household size, number of pets, and special-needs or medical notes.
- AI checklist generation via `/api/ai/generate-plan`.
- Rotating progress messages while the checklist is being generated.
- Saved checklist history loaded from `/api/checklist`.
- Checklist detail view with completion counter.
- Item toggle support for marking tasks complete/incomplete.
- Unsaved/synced state indicator.
- Manual save action.
- Auto-save on view changes and before page unload.
- Delete action for removing a saved checklist.
- Mobile floating action button to open the drawer.

### `/page-profile` Resident Profile

- Loads the authenticated resident profile from Supabase and `/api/user/[id]`.
- Identity card with generated avatar, role badge, and assigned region.
- Edit profile drawer for display name and region updates.
- Read-only email field in the profile editor.
- Rescue-card section showing blood type, allergies, medical conditions, emergency contact, phone number, and home base address or coordinates.
- Rescue-card editing drawer with blood type selection, allergy and medical-condition fields, emergency contact fields, home address input, address lookup via `/api/geocode`, map-based pin selection, reverse geocoding via `/api/reverse-geocode`, coordinate preview, and QR code generation on save.
- Emergency QR panel for first responders when QR data exists.
- Toast feedback for profile and rescue-card saves.
- Loading and fetch-error states.

## Admin Pages

### `/admin/page-sos` SOS Dashboard

- Split layout with request queue on the left and detail panel on the right.
- Empty-state detail panel prompting the admin to select a request.
- Active SOS request list built from `/api/reports`.
- Severity filter chips for `False Alarm`, `Low`, `Medium`, `High`, and `Critical`.
- Per-severity request counts.
- Refresh button to reload the request list.
- Request tabs show severity, hazard type, location, and report time.
- Clicking a request opens its detailed triage page.

### `/admin/page-sos/[uid]` SOS Triage Detail

- Incident map centered on the reported SOS coordinates.
- Rescue card summary for the affected resident.
- Medical details pulled from the resident rescue card.
- Emergency contact and home address visibility for responders.
- AI signal intelligence panel showing the recommended action summary from triage output.
- Loading state while report and resident data are being fetched.
- Secure-system status footer strip.

### `/admin/page-alerts` AI Alert Draft Review

- Loads draft alerts from `/api/alert?status=draft`.
- Shows empty state when there are no pending drafts.
- Displays severity badge, title, and generated alert body for each draft.
- `Approve & Publish` action posts to `/api/alert/approve`.
- Per-alert loading state while publishing.
- Success banner after publication.
- Refreshes the draft list after an alert is published.

### `/admin/page-profile` Admin Profile

- Loads the authenticated admin profile from Supabase and `/api/user/[id]`.
- Admin identity card with avatar, role badge, and assigned region.
- Edit profile drawer for name and region updates.
- Account details panel showing display name, email, role, and region.
- Admin access panel summarizing the control-panel workspace.
- Toast feedback for successful profile updates.
- Loading and fetch-error states.

## API-backed Features

The platform is driven by a set of Next.js route handlers that connect the UI to Prisma, PostgreSQL, Gemini, Google Maps, Supabase-authenticated users, and QR generation.

### Core API Reference

| Route | Method | Purpose | Main Input | Main Output | Used By |
| --- | --- | --- | --- | --- | --- |
| `/api/reports` | `POST` | Submit a resident SOS report and run AI triage | `userId`, `lat`, `lng`, `hazardType`, `description` | Saved incident report, reverse-geocoded address, AI triage payload | Home page SOS modal |
| `/api/reports` | `GET` | Load all incident reports for the admin queue | None | Incident report list ordered by newest first | Admin SOS dashboard |
| `/api/reports/[id]` | `GET` | Load one SOS report in detail | Report ID in route | One incident report with linked user info | Admin SOS detail page |
| `/api/reports/[id]` | `PATCH` | Update a report status | `status` | Updated incident report | Admin responder workflow support |
| `/api/alert` | `GET` | Load alert feed data | None | Formatted alert list with date/time/coords/status | Resident alerts page, home latest alerts, admin draft review |
| `/api/alert` | `POST` | Create a new alert record as an admin | `userId`, `regionCode`, `hazardType`, `severity`, `title`, `body`, `lat`, `lng` | Saved alert | Admin alert creation flow |
| `/api/alert/approve` | `POST` | Publish a draft alert | `alertId` | Updated alert with published status | Admin AI draft review page |
| `/api/ai/quiz` | `POST` | Generate a simulation scenario | `hazardType`, optional `region` | Scenario, 3 options, correct answer index, explanation | AI Survival Simulator |
| `/api/ai/generate-plan` | `POST` | Generate and save a personalized checklist | `userId`, `hazardType`, `familySize`, `pets`, `specialNeeds` | Saved emergency plan with title and checklist JSON | Smart Emergency Checklists |
| `/api/geocode` | `POST` | Convert a typed address into coordinates | `address` | Formatted address, `lat`, `lng` | Rescue-card editor |
| `/api/reverse-geocode` | `POST` | Convert map coordinates into a readable address | `lat`, `lng` | Formatted address, `lat`, `lng` | Rescue-card editor, SOS/report enrichment |
| `/api/rescue-card` | `GET` | Fetch a resident rescue card by email | `email` query param | Rescue-card record | Home page, profile page, admin SOS detail |
| `/api/rescue-card` | `POST` | Create or update rescue-card data and QR code | `email`, medical/contact/home fields | Upserted rescue card, QR code data, shareable map URL | Resident profile page |
| `/api/user/[id]` | `GET` | Fetch a user profile with rescue-card relation | User ID in route | User record with role, region, and rescue card | Home, resident profile, admin profile, role-aware header |
| `/api/user/[id]` | `PATCH` | Update profile fields | `name`, `regionCode` | Updated user record | Resident profile, admin profile |

### What Each API Group Does

| API Group | What It Handles | Notes |
| --- | --- | --- |
| SOS and triage | Emergency submissions, incident storage, admin queue loading, and per-incident inspection | Includes Gemini-based triage and Google reverse geocoding during SOS creation |
| Alerts | Alert feed retrieval, admin alert creation, and draft approval | Alert feed responses are formatted for the resident UI with ready-to-render date and time values |
| AI generation | Survival quiz generation and emergency checklist generation | Both use Gemini and return structured JSON that the frontend renders directly |
| Mapping and location | Address lookup and reverse geocoding | Used mainly inside the rescue-card workflow for reliable home-location capture |
| Identity and rescue data | User profile loading and rescue-card management | Returns role-aware data so the header and protected admin routes can adjust UI behavior |

### Endpoint Details

| Endpoint | Detailed Behavior |
| --- | --- |
| `/api/reports` | On SOS submission, the backend validates required fields, reverse-geocodes the live GPS position into a readable address when Google Maps is configured, sends the resident's free-text description to Gemini for emergency triage, classifies severity and recommended response, then stores everything in `IncidentReport`. The `GET` side powers the admin request queue. |
| `/api/reports/[id]` | Returns a single incident report with linked user data so responders can inspect a specific SOS case. The `PATCH` handler supports updating report status as the response workflow matures. |
| `/api/alert` | The `GET` handler returns alerts in a UI-friendly format with normalized date, time, coordinates, severity, hazard type, and status. The `POST` handler is admin-only and stores a new alert record for broadcast use. |
| `/api/alert/approve` | Changes an alert from draft to published so it appears in the resident-facing alert feed. This powers the admin review-and-publish step for AI-generated weather drafts. |
| `/api/ai/quiz` | Builds a single-turn emergency scenario tailored to the selected hazard and region. The response includes a realistic scenario, 3 choices, one correct answer, and a short safety explanation. |
| `/api/ai/generate-plan` | Creates a personalized emergency checklist based on hazard type, household size, pets, and special needs. The generated plan is saved into PostgreSQL immediately so it appears in checklist history without another save step. |
| `/api/geocode` | Accepts a typed address and resolves it into a canonical formatted address and coordinates using Google Maps Geocoding. This helps residents search for their home before fine-tuning the location on the map. |
| `/api/reverse-geocode` | Accepts map coordinates and resolves them back into a readable address. This keeps the rescue card synchronized when the resident adjusts their home pin manually. |
| `/api/rescue-card` | The `GET` handler fetches rescue-card data by email for resident and responder views. The `POST` handler upserts the rescue card, reverse-geocodes the home location when coordinates are present, generates a QR code from the medical/contact payload, and stores a shareable Google Maps URL. |
| `/api/user/[id]` | The `GET` handler returns the user profile together with the related rescue card so the frontend can render role, region, and medical identity in one request. The `PATCH` handler updates editable profile fields like name and assigned region. |

### External Services Used By The APIs

| Service | Where It Is Used | Why It Matters |
| --- | --- | --- |
| Gemini | `/api/reports`, `/api/ai/quiz`, `/api/ai/generate-plan` | Adds AI triage, training scenarios, and personalized preparedness plans |
| Google Maps Geocoding API | `/api/geocode`, `/api/reverse-geocode`, `/api/reports`, `/api/rescue-card` | Turns coordinates into addresses and addresses into coordinates |
| Prisma + PostgreSQL | Most route handlers | Stores users, alerts, rescue cards, incident reports, and emergency plans |
| QRCode library | `/api/rescue-card` | Generates a scannable emergency QR image for responders |

### How These APIs Support The Product Flow

| User Flow | API Support |
| --- | --- |
| Resident presses `SOS` | `/api/reports` captures GPS, geocodes location, runs AI triage, and saves the incident |
| Admin reviews active incidents | `/api/reports` and `/api/reports/[id]` provide queue and detail views |
| Resident updates profile and rescue card | `/api/user/[id]`, `/api/rescue-card`, `/api/geocode`, and `/api/reverse-geocode` keep identity and home-location data current |
| Resident practices preparedness | `/api/ai/quiz` and `/api/ai/generate-plan` create learning and planning content |
| Admin publishes warnings | `/api/alert` and `/api/alert/approve` move alerts from storage or draft review into the public feed |

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- MUI
- Supabase Auth
- Prisma + PostgreSQL
- Google Maps APIs
- Gemini API
- QR code generation

## Main Routes

### Resident

- `/`
- `/page-alerts`
- `/page-resources`
- `/page-resources/page-resources-simulation`
- `/page-resources/page-resources-checklist`
- `/page-profile`

### Admin

- `/admin/page-sos`
- `/admin/page-sos/[uid]`
- `/admin/page-alerts`
- `/admin/page-profile`
