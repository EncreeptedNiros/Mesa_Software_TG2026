#FROM nginx:alpine
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5080

ENV ASPNETCORE_URLS=http://+:5080

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-dotnet-configure-containers
RUN useradd -u 5678 -m appuser && chown -R appuser /app
USER appuser

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG configuration=Release
WORKDIR /src

#O abaixo depende do arquivo dockercompose que eu for utilizar, vou deixar pra mudar a posteriore
COPY ["./API/MesaApi/MesaApi.csproj", "./"] 

RUN dotnet restore "./MesaApi.csproj"
COPY . .
WORKDIR "/src/."

#O abaixo depende do arquivo dockercompose que eu for utilizar, vou deixar pra mudar a posteriore
RUN dotnet build "./API/MesaApi/MesaApi.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release

#O abaixo depende do arquivo dockercompose que eu for utilizar, vou deixar pra mudar a posteriore
RUN dotnet publish "./API/MesaApi/MesaApi.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MesaApi.dll"]
