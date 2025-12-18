# Backend - Django REST API

Tax compliance backend with share management and capital gains calculations.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run server:
```bash
python manage.py runserver
```

## API Endpoints

- `/api/company/` - Company management
- `/api/shares/` - Share management
- `/api/transfers/` - Transfer operations
- `/api/userdata/` - User information

## Models

- **Company**: Corporate entities with blockchain contracts
- **Share**: Individual share tokens with VPP calculations
- **Transfer**: Share transfers with tax calculations
- **CustomUser**: Users with roles (authority/shareholder)
