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
