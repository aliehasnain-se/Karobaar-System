# Karobaar Backend

Django REST Framework API for the Karobaar System.

## Local setup

1. Install PostgreSQL and create a database named `karobaar`.
2. Create `backend/.env` from `.env.example` and set `DB_PASSWORD` plus a private `DJANGO_SECRET_KEY`.
3. Create and activate a virtual environment.
4. Install dependencies with `pip install -r requirements/development.txt`.
5. Run `python manage.py migrate`.
6. Create the owner with `python manage.py createsuperuser`.
7. Start the API with `python manage.py runserver`.

The React app can use `http://127.0.0.1:8000/api/v1/` during local development.

## Quality checks

- `ruff check .`
- `ruff format --check .`
- `pytest`
