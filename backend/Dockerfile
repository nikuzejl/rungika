FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew build
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build app/build/libs/rungika-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]

