FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:7.0 as build
WORKDIR /src
COPY . .
RUN apt-get update -yq && apt-get upgrade -yq && apt-get install -yq curl git nano
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -yq nodejs build-essential
RUN apt-get update && apt-get install -y nodejs
RUN ./build.sh --runtime $BUILDPLATFORM

FROM mcr.microsoft.com/dotnet/aspnet:7.0 as runtime
WORKDIR /app
COPY --from=build /src/artifacts .
EXPOSE 80
ENTRYPOINT ["dotnet", "AZChat.dll"]