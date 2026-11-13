# DB Monitor API (Vercel)

REST backend for DB Monitor v2.3.0 cloud sync.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /api/items | JSON array of all records |
| GET | /api/items/:id | One record |
| PUT | /api/items/:id | Create/replace (last-write-wins by `updatedAt`) |
| DELETE | /api/items/:id | Remove a record |
| GET | /api/tecmis-last-date | Get the latest posted_at date from TECMIS notices (for incremental sync) |
| DELETE | /api/tecmis-delete?id=xxx | Delete a specific TECMIS notice by ID |
| DELETE | /api/tecmis-delete-old | Delete TECMIS notices not in provided list (body: `{"currentIds": [...]}`) |

Auth: `Authorization: Bearer <API_TOKEN>`, `X-API-Key: <API_TOKEN>`, or `?key=<API_TOKEN>`.

## Deploy
1. `npm install`
2. `npm i -g vercel && vercel` (link the project)
3. Vercel dashboard -> Storage / Marketplace -> add **Upstash Redis** and connect it to this project
4. Project -> Settings -> Environment Variables -> add `API_TOKEN`
5. Project -> Settings -> Deployment Protection -> disable for Production (otherwise the phone gets an HTML login page)
6. `vercel --prod`

## Test
```bash
curl https://<project>.vercel.app/api/items -H "Authorization: Bearer $API_TOKEN"
# -> []

curl -X PUT https://<project>.vercel.app/api/items/evt-8842 \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"evt-8842","title":"Replication lag warning","body":"## Status\nLag is **18s**.","type":"warning","createdAt":"2026-11-12T21:44:00Z","updatedAt":"2026-11-12T21:44:00Z","done":false,"seen":false,"source":"api"}'

# TECMIS-specific endpoints:

# Get last TECMIS notice date
curl https://<project>.vercel.app/api/tecmis-last-date \
  -H "Authorization: Bearer $API_TOKEN"

# Delete a specific TECMIS notice
curl -X DELETE https://<project>.vercel.app/api/tecmis-delete?id=tecmis-notice-123 \
  -H "Authorization: Bearer $API_TOKEN"

# Delete old TECMIS notices (keep only the ones in the list)
curl -X DELETE https://<project>.vercel.app/api/tecmis-delete-old \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"currentIds":["tecmis-notice-3190","tecmis-file-261111105101-ICT - Exam Timetable.pdf"]}'
```

## App setup
Settings -> Cloud sync -> REST -> base URL `https://<project>.vercel.app/api/items`
(if the app can't send headers, use `https://<project>.vercel.app/api/items?key=<API_TOKEN>` if it supports query strings, otherwise check the app source for its auth options).
