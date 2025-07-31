# Usar a imagem base do ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7100
EXPOSE 7101

# Usar a imagem SDK para build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CMShop.APIGateway/CMShop.APIGateway.csproj", "CMShop.APIGateway/"]
RUN dotnet restore "CMShop.APIGateway/CMShop.APIGateway.csproj"
COPY . .
WORKDIR "/src/CMShop.APIGateway"
RUN dotnet build "CMShop.APIGateway.csproj" -c Release -o /app/build

# Publicar a aplicação
FROM build AS publish
RUN dotnet publish "CMShop.APIGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CMShop.APIGateway.dll"]
