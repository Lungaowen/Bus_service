FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ComplaintModule/ComplaintModule.csproj ComplaintModule/
RUN dotnet restore ComplaintModule/ComplaintModule.csproj
COPY . .
RUN dotnet publish ComplaintModule/ComplaintModule.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT dotnet ComplaintModule.dll --urls http://0.0.0.0:${PORT:-8080}
