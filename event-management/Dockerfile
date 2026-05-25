# Stage 1: Build stage
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Prefetch dependencies to cache them in Docker layers for faster subsequent builds
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
