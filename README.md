# DB Monitor API (Vercel)

REST backend for DB Monitor v2.3.0 cloud sync.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /api/items | JSON array of all records |
| GET | /api/items/:id | One record |
| PUT | /api/items/:id | Create/replace (last-write-wins by `updatedAt`) |
| DELETE | /api/items/:id | Remove a record |

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
```

## App setup
Settings -> Cloud sync -> REST -> base URL `https://<project>.vercel.app/api/items`
(if the app can't send headers, use `https://<project>.vercel.app/api/items?key=<API_TOKEN>` if it supports query strings, otherwise check the app source for its auth options).
