#!/bin/bash
# SmartClass System - Automated Setup Script
# This script creates the complete project structure and helps with initial setup

set -e

echo "🎓 SmartClass System - Setup Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Create project root
PROJECT_NAME="smartclass-system"
echo ""
echo "Creating project structure in: ./$PROJECT_NAME"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create backend structure
echo -e "${BLUE}Creating backend structure...${NC}"
mkdir -p backend/SmartClass.API/{Controllers,Models/{Entities,DTOs/Auth},Data,Services}

# Create frontend structure
echo -e "${BLUE}Creating frontend structure...${NC}"
mkdir -p frontend/src/{app/{core/{models,services,guards,interceptors},features/{auth/{login,register},dashboard,classes/{create-class,join-class}}},environments}

# Create README
cat > README.md << 'EOF'
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
EOF

echo -e "${GREEN}✓${NC} Project structure created"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Copy the implementation files from the artifacts to their respective locations:"
echo "   - docker-compose.yml → $PROJECT_NAME/"
echo "   - Backend files → $PROJECT_NAME/backend/SmartClass.API/"
echo "   - Frontend files → $PROJECT_NAME/frontend/src/"
echo ""
echo "2. Navigate to project: cd $PROJECT_NAME"
echo ""
echo "3. Start the system: docker-compose up -d"
echo ""
echo "4. Wait 30 seconds, then apply migrations:"
echo "   docker-compose exec backend dotnet ef database update"
echo ""
echo "5. Access the application:"
echo "   - Frontend: http://localhost:4200"
echo "   - Backend: http://localhost:5000"
echo "   - Swagger: http://localhost:5000/swagger"
echo ""
echo -e "${GREEN}Setup script completed!${NC}"
echo ""
echo "Project location: $(pwd)"

# Create a helper script for common operations
cat > manage.sh << 'MANAGESCRIPT'
#!/bin/bash
# SmartClass Management Script

case "$1" in
    start)
        echo "Starting SmartClass system..."
        docker-compose up -d
        echo "Waiting for services to initialize..."
        sleep 30
        echo "Applying database migrations..."
        docker-compose exec backend dotnet ef database update
        echo "✓ System is ready!"
        echo "  Frontend: http://localhost:4200"
        echo "  Backend: http://localhost:5000"
        echo "  Swagger: http://localhost:5000/swagger"
        ;;
    stop)
        echo "Stopping SmartClass system..."
        docker-compose down
        echo "✓ System stopped"
        ;;
    reset)
        echo "⚠️  This will delete all data. Are you sure? (yes/no)"
        read confirm
        if [ "$confirm" = "yes" ]; then
            echo "Resetting system..."
            docker-compose down -v
            docker-compose up -d
            sleep 30
            docker-compose exec backend dotnet ef database update
            echo "✓ System reset complete"
        else
            echo "Reset cancelled"
        fi
        ;;
    logs)
        service=${2:-backend}
        echo "Showing logs for $service..."
        docker-compose logs -f $service
        ;;
    status)
        echo "SmartClass System Status:"
        docker-compose ps
        ;;
    migrate)
        echo "Applying database migrations..."
        docker-compose exec backend dotnet ef database update
        echo "✓ Migrations applied"
        ;;
    backup-db)
        echo "Creating database backup..."
        timestamp=$(date +%Y%m%d_%H%M%S)
        docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd \
            -S localhost -U sa -P "YourStrong@Passw0rd" \
            -Q "BACKUP DATABASE SmartClassDB TO DISK='/var/opt/mssql/backup_${timestamp}.bak'"
        echo "✓ Backup created: backup_${timestamp}.bak"
        ;;
    *)
        echo "SmartClass Management Script"
        echo ""
        echo "Usage: ./manage.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start       - Start all services and apply migrations"
        echo "  stop        - Stop all services"
        echo "  reset       - Reset system (deletes all data)"
        echo "  logs [name] - Show logs for service (default: backend)"
        echo "  status      - Show status of all services"
        echo "  migrate     - Apply database migrations"
        echo "  backup-db   - Create database backup"
        echo ""
        echo "Examples:"
        echo "  ./manage.sh start"
        echo "  ./manage.sh logs backend"
        echo "  ./manage.sh logs frontend"
        ;;
esac
MANAGESCRIPT

chmod +x manage.sh
echo ""
echo -e "${GREEN}✓${NC} Management script created: ./manage.sh"
echo ""
echo "Use './manage.sh' to see available commands for managing the system"

---
# Windows PowerShell Setup Script
# Save as: setup.ps1

Write-Host "🎓 SmartClass System - Setup Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Create project structure
$projectName = "smartclass-system"
Write-Host ""
Write-Host "Creating project structure in: .\$projectName" -ForegroundColor Blue

New-Item -ItemType Directory -Force -Path $projectName | Out-Null
Set-Location $projectName

# Create backend structure
Write-Host "Creating backend structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "backend\SmartClass.API\Controllers" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\SmartClass.API\Models\Entities" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\SmartClass.API\Models\DTOs\Auth" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\SmartClass.API\Data" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\SmartClass.API\Services" | Out-Null

# Create frontend structure
Write-Host "Creating frontend structure..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "frontend\src\app\core\models" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\core\services" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\core\guards" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\core\interceptors" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\features\auth\login" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\features\auth\register" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\features\dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\features\classes\create-class" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\app\features\classes\join-class" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend\src\environments" | Out-Null

Write-Host "✓ Project structure created" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Copy the implementation files from the artifacts"
Write-Host "2. Navigate to project: cd $projectName"
Write-Host "3. Start the system: docker-compose up -d"
Write-Host "4. Apply migrations: docker-compose exec backend dotnet ef database update"
Write-Host "5. Access at http://localhost:4200"
Write-Host ""
Write-Host "✓ Setup script completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Project location: $((Get-Location).Path)"

---
# Quick Reference Card

╔════════════════════════════════════════════════════════════════╗
║           SMARTCLASS SYSTEM - QUICK REFERENCE                  ║
╚════════════════════════════════════════════════════════════════╝

📁 PROJECT STRUCTURE:
  smartclass-system/
  ├── docker-compose.yml
  ├── backend/SmartClass.API/
  └── frontend/src/

🚀 START SYSTEM:
  $ docker-compose up -d
  $ docker-compose exec backend dotnet ef database update

🌐 ACCESS POINTS:
  Frontend:  http://localhost:4200
  Backend:   http://localhost:5000
  Swagger:   http://localhost:5000/swagger
  Database:  localhost:1433

🔑 DEFAULT CREDENTIALS:
  Create through registration page
  Teacher: Select "Teacher" role
  Student: Select "Student" role

⚡ COMMON COMMANDS:
  View logs:     docker-compose logs -f [service]
  Stop system:   docker-compose down
  Reset all:     docker-compose down -v
  Restart:       docker-compose restart [service]

🐛 TROUBLESHOOTING:
  • Backend fails: Check logs, ensure DB is ready
  • Frontend 404:  Verify nginx.conf is correct
  • DB connection: Check connection string
  • Migration fails: Clear Migrations/ folder, recreate

📊 DATABASE ACCESS:
  $ docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd \
    -S localhost -U sa -P "YourStrong@Passw0rd"

🔧 DEVELOPMENT MODE:
  Backend:  cd backend/SmartClass.API && dotnet run
  Frontend: cd frontend && ng serve

🧪 TESTING:
  Backend:  cd backend/SmartClass.Tests && dotnet test
  Frontend: cd frontend && ng test

📦 BUILD FOR PRODUCTION:
  Backend:  dotnet publish -c Release
  Frontend: ng build --configuration production

🔐 SECURITY CHECKLIST:
  ☐ Change JWT secret
  ☐ Use strong DB password
  ☐ Enable HTTPS
  ☐ Configure CORS properly
  ☐ Implement rate limiting
  ☐ Add proper logging
  ☐ Use Azure Key Vault for secrets

🚢 AZURE DEPLOYMENT:
  1. Push images to container registry
  2. Create Azure resources
  3. Deploy App Service
  4. Configure environment variables
  5. Set up CI/CD pipeline

📈 FEATURES STATUS:
  ✅ User Authentication (JWT)
  ✅ Class Management
  ✅ Join Code System
  ✅ Role-based Access
  ⏳ Assignments
  ⏳ Submissions
  ⏳ Grading
  ⏳ Announcements
  ⏳ Notifications

💡 TIPS:
  • Use ./manage.sh for common tasks
  • Check Swagger for API testing
  • Monitor logs for debugging
  • Back up database regularly

═══════════════════════════════════════════════════════════════════