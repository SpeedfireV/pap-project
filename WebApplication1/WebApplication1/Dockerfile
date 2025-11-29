# --------------------------------------------------------------------------
# Stage 1: Base Runtime (The minimal production environment)
# --------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
# Use the built-in 'app' non-root user for enhanced security.
# This user is automatically created in the modern .NET base images.
USER app 
WORKDIR /app
# ASP.NET Core runs on 8080 by default in containerized non-root environments.
EXPOSE 8080
# Expose 8081 for HTTPS, if you plan to configure Kestrel for it.
EXPOSE 8081
# Explicitly set the URLs environment variable for Kestrel to ensure it binds correctly
# to the exposed ports within the container.
ENV ASPNETCORE_URLS=http://+:8080;https://+:8081

# --------------------------------------------------------------------------
# Stage 2: Build (Includes the SDK for compilation and dependency restore)
# --------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
# Copy the project file with its exact name and path
COPY ["./WebApplication1.csproj", "./"]
# Restore dependencies for the project
RUN dotnet restore
# Copy all source code now
COPY . .
# Set the final working directory for building (which is /src inside the container)
WORKDIR "/src"
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

# --------------------------------------------------------------------------
# Stage 3: Publish (Creates the final, runnable application artifacts)
# --------------------------------------------------------------------------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
# Publish the application, generating all necessary files into /app/publish
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false