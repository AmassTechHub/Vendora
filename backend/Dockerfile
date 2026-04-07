FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod
COPY --from=build /app/target/*.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", \
  "-Xmx256m", \
  "-Xms128m", \
  "-XX:+UseSerialGC", \
  "-Dserver.port=${PORT:-10000}", \
  "-jar", "/app/app.jar"]
