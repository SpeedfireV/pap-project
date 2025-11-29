FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER app 
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080;https://+:8081

# --------------------------------------------------------------------------
# Stage 2: Build (Includes the SDK for compilation and dependency restore)
# --------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# List files to debug build context
RUN ls -la

# Use a different approach for copying the project file
COPY WebApplication1.csproj .
# Restore dependencies for the project
RUN dotnet restore
# Copy all source code now
COPY . .
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