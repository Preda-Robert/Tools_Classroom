# SmartClass System

Online Classroom Management System

## Quick Start

1. Ensure Docker Desktop is running
2. Run: `docker-compose up -d`
3. Wait 30 seconds
4. Run: `docker-compose exec backend dotnet ef database update`
5. Open: http://localhost:4200

## Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

## Default Ports

- Frontend: 4200
- Backend: 5000
- Database: 1433

## Test Users

Create test accounts through the registration page:
- Teacher: Use role "Teacher" when registering
- Student: Use role "Student" when registering

## Stopping the System

```bash
docker-compose down
```

## Reset Everything

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend dotnet ef database update
```

## Manual Setup (without Docker)

### Backend
```bash
cd backend/SmartClass.API
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd frontend
npm install
ng serve
```
