FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

# Just start the app
ENTRYPOINT ["dotnet", "SmartClass.API.dll"]
