# --------------------------------------------------------------------------
# Stage 1: Base Runtime (The minimal production environment)
# --------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER app 
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080

# --------------------------------------------------------------------------
# Stage 2: Build (Includes the SDK for compilation and dependency restore)
# --------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the project file with the full path
COPY ["WebApplication1/WebApplication1.csproj", "./"]
# Restore dependencies for the project
RUN dotnet restore

# Copy all source code from the WebApplication1 directory
COPY WebApplication1/. .

# Build the project
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

# --------------------------------------------------------------------------
# Stage 3: Publish (Creates the final, runnable application artifacts)
# --------------------------------------------------------------------------
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
# Publish the application, generating all necessary files into /app/publish
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# --------------------------------------------------------------------------
# Stage 4: Final (The production-ready, minimal image)
# --------------------------------------------------------------------------
FROM base AS final
WORKDIR /app
# COPY only the published application files from the 'publish' stage.
COPY --from=publish /app/publish .
# Define the command to execute when the container starts.
ENTRYPOINT ["dotnet", "WebApplication1.dll"]