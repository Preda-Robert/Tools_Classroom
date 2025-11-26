# root
New-Item -ItemType Directory -Path "SmartClass" | Out-Null
Set-Location "SmartClass"

New-Item ".env" -ItemType File | Out-Null
New-Item "docker-compose.yml" -ItemType File | Out-Null

# ========== BACKEND ==========
New-Item -ItemType Directory -Path "backend" | Out-Null

# SmartClass.API project
New-Item -ItemType Directory -Path "backend/SmartClass.API" | Out-Null
New-Item "backend/SmartClass.API/Program.cs" -ItemType File | Out-Null
New-Item "backend/SmartClass.API/appsettings.json" -ItemType File | Out-Null
New-Item "backend/SmartClass.API/SmartClass.API.csproj" -ItemType File | Out-Null
New-Item "backend/SmartClass.API/Dockerfile" -ItemType File | Out-Null

# Controllers
$controllers = @(
    "AuthController.cs",
    "ClassesController.cs",
    "AssignmentsController.cs",
    "SubmissionsController.cs",
    "AnnouncementsController.cs"
)
New-Item -ItemType Directory -Path "backend/SmartClass.API/Controllers" | Out-Null
foreach ($c in $controllers) { New-Item "backend/SmartClass.API/Controllers/$c" -ItemType File | Out-Null }

# Models
New-Item -ItemType Directory -Path "backend/SmartClass.API/Models/Entities" -Force | Out-Null
$entities = @(
    "User.cs", "Class.cs", "ClassEnrollment.cs",
    "Assignment.cs", "Submission.cs", "Announcement.cs"
)
foreach ($e in $entities) {
    New-Item "backend/SmartClass.API/Models/Entities/$e" -ItemType File | Out-Null
}

# DTOs
New-Item -ItemType Directory -Path "backend/SmartClass.API/Models/DTOs/Auth" -Force | Out-Null
New-Item "backend/SmartClass.API/Models/DTOs/ClassDto.cs" -ItemType File | Out-Null
New-Item "backend/SmartClass.API/Models/DTOs/AssignmentDto.cs" -ItemType File | Out-Null
New-Item "backend/SmartClass.API/Models/DTOs/SubmissionDto.cs" -ItemType File | Out-Null

$authDtos = @("RegisterDto.cs", "LoginDto.cs", "AuthResponseDto.cs")
foreach ($d in $authDtos) {
    New-Item "backend/SmartClass.API/Models/DTOs/Auth/$d" -ItemType File | Out-Null
}

# Data
New-Item -ItemType Directory -Path "backend/SmartClass.API/Data/Migrations" -Force | Out-Null
New-Item "backend/SmartClass.API/Data/ApplicationDbContext.cs" -ItemType File | Out-Null

# Services
New-Item -ItemType Directory -Path "backend/SmartClass.API/Services" | Out-Null
$services = @(
    "IAuthService.cs", "AuthService.cs",
    "IClassService.cs", "ClassService.cs"
)
foreach ($s in $services) {
    New-Item "backend/SmartClass.API/Services/$s" -ItemType File | Out-Null
}

# Middleware
New-Item -ItemType Directory -Path "backend/SmartClass.API/Middleware" | Out-Null
New-Item "backend/SmartClass.API/Middleware/ExceptionMiddleware.cs" -ItemType File | Out-Null

# Tests
New-Item -ItemType Directory -Path "backend/SmartClass.Tests/Controllers" -Force | Out-Null
New-Item "backend/SmartClass.Tests/Controllers/AuthControllerTests.cs" -ItemType File | Out-Null

# ========== FRONTEND ==========
New-Item -ItemType Directory -Path "frontend" -Force | Out-Null
New-Item "frontend/package.json" -ItemType File | Out-Null
New-Item "frontend/angular.json" -ItemType File | Out-Null
New-Item "frontend/tsconfig.json" -ItemType File | Out-Null
New-Item "frontend/Dockerfile" -ItemType File | Out-Null
New-Item "frontend/nginx.conf" -ItemType File | Out-Null

# Angular src structure
New-Item -ItemType Directory -Path "frontend/src/app/core/services" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/core/guards" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/core/interceptors" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/core/models" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/auth/login" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/auth/register" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/dashboard" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/classes/class-list" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/classes/class-detail" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/classes/create-class" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/assignments/assignment-list" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/features/assignments/submit-assignment" -Force | Out-Null

New-Item -ItemType Directory -Path "frontend/src/app/shared/components/navbar" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/shared/components/sidebar" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/app/shared" -Force | Out-Null

# Core services
$coreServices = @("auth.service.ts", "class.service.ts", "assignment.service.ts")
foreach ($f in $coreServices) {
    New-Item "frontend/src/app/core/services/$f" -ItemType File | Out-Null
}

# Core guards, interceptors, models
New-Item "frontend/src/app/core/guards/auth.guard.ts" -ItemType File | Out-Null
New-Item "frontend/src/app/core/interceptors/auth.interceptor.ts" -ItemType File | Out-Null
$coreModels = @("user.model.ts", "class.model.ts", "assignment.model.ts")
foreach ($f in $coreModels) {
    New-Item "frontend/src/app/core/models/$f" -ItemType File | Out-Null
}

# Feature components
$featureFiles = @{
    "frontend/src/app/features/auth/login" = "login.component.ts"
    "frontend/src/app/features/auth/register" = "register.component.ts"
    "frontend/src/app/features/dashboard" = "dashboard.component.ts"
    "frontend/src/app/features/classes/class-list" = "class-list.component.ts"
    "frontend/src/app/features/classes/class-detail" = "class-detail.component.ts"
    "frontend/src/app/features/classes/create-class" = "create-class.component.ts"
    "frontend/src/app/features/assignments/assignment-list" = "assignment-list.component.ts"
    "frontend/src/app/features/assignments/submit-assignment" = "submit-assignment.component.ts"
}
foreach ($path in $featureFiles.Keys) {
    New-Item "$path/$($featureFiles[$path])" -ItemType File | Out-Null
}

# Shared components
New-Item "frontend/src/app/shared/components/navbar/navbar.component.ts" -ItemType File | Out-Null
New-Item "frontend/src/app/shared/components/sidebar/sidebar.component.ts" -ItemType File | Out-Null
New-Item "frontend/src/app/shared/material.module.ts" -ItemType File | Out-Null

# Angular root files
New-Item "frontend/src/app/app.component.ts" -ItemType File | Out-Null
New-Item "frontend/src/app/app.routes.ts" -ItemType File | Out-Null
New-Item "frontend/src/app/app.config.ts" -ItemType File | Out-Null

New-Item -ItemType Directory -Path "frontend/src/environments" -Force | Out-Null
New-Item "frontend/src/environments/environment.ts" -ItemType File | Out-Null
New-Item "frontend/src/environments/environment.prod.ts" -ItemType File | Out-Null

New-Item "frontend/src/styles.scss" -ItemType File | Out-Null

Write-Host "SmartClass folder structure created successfully!" -ForegroundColor Green
