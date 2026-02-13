# Restaurant App MVP Monorepo

## Structure
- `apps/api`: FastAPI + SQLite backend
- `apps/mobile`: Expo React Native app (TypeScript + Expo Router + Zustand + RHF/Zod + TanStack Query + NativeWind)

## Prerequisites
- Python 3.11+
- Node.js 18+
- npm
- Expo Go app/emulator

## Run backend
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
OpenAPI docs: `http://127.0.0.1:8000/docs`

## Seed demo data
Seed runs automatically on startup (categories/menu/options/users).

Demo accounts:
- Admin: `admin@restaurant.app` / `admin1234`
- Customer: `demo@restaurant.app` / `demo1234`

## Run mobile
```bash
cd apps/mobile
npm install
npx expo start
```

## Tests
Backend:
```bash
cd apps/api
pytest
```

Mobile:
```bash
cd apps/mobile
npm test
```

## Implemented MVP highlights
- Auth/register/login + mock forgot password
- Browse categories/menu/search + add to cart
- Cart checkout with delivery/pickup + notes + mock payment
- Orders + status tracking timeline
- Favorites API + mobile screen
- Settings with dark toggle + about/contact
- Admin screen (role-based in same app): category create, analytics, order status updates
