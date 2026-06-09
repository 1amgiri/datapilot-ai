# DataPilot AI - Spring Boot Backend

Production-quality Spring Boot microservice acting as a multi-agent reasoning orchestrator.

## Tech Stack
* Java 21
* Spring Boot 3.4.3
* Spring AI (Azure OpenAI)
* MySQL
* Maven
* Docker

## Getting Started

## Prerequisites
* JDK 21
* Maven 3.9+
* MySQL (Running on port 3306 by default)

### Running Locally

1. Create a MySQL database called `datapilot_db` on port `3306`.
2. Configure credentials in your environment variables (Optional, defaults to mock/sandbox mode if missing):
   ```bash
   export AZURE_OPENAI_API_KEY="your-key"
   export AZURE_OPENAI_ENDPOINT="your-endpoint"
   ```
3. Run the application:
   ```bash
   mvn clean spring-boot:run
   ```
4. Access Swagger API Docs at:
   `http://localhost:8080/swagger-ui.html`

## Docker Deployment

Build and run using Docker:
```bash
docker build -t datapilot-backend .
docker run -p 8080:8080 datapilot-backend
```
