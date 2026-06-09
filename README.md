# DataPilot AI 🚀

> Transform business requirements into data architectures, SQL solutions, analytics pipelines, and implementation plans through intelligent multi-agent reasoning.

DataPilot AI is a workflow-driven multi-agent platform designed for the **Microsoft Agents League Hackathon**. 

---

## 📂 Project Structure

```
datapilot-ai/
│
├── backend/            # Spring Boot 3.4.3 + Spring AI + PostgreSQL (Java 21)
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── README.md
│
├── frontend/           # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── docs/               # System and API specifications
│   ├── architecture.md
│   ├── api-spec.md
│   └── prompts.md
│
├── presentation/       # Slides and presentation assets
├── prompts/            # Agentic system prompt backups
├── .gitignore          # Root Git configurations
└── README.md           # Main project entry document
```

---

## 🤖 Agentic Architecture
DataPilot AI orchestrates 4 distinct reasoning agents sequentially:
1. **Requirement Analyst Agent**: Analyzes constraints, KPIs, and goals.
2. **Data Architect Agent**: Designs optimized SQL Star Schemas.
3. **SQL Engineer Agent**: Writes optimized reporting CTEs and analytics queries.
4. **Pipeline Advisor Agent**: Outlines Microsoft Fabric Medallion ingestion structures.

---

## ⚡ Quick Start

### 1. Run the Backend (Java 21)
```bash
cd backend
mvn clean spring-boot:run
```
*Accessible on `http://localhost:8080` (Swagger UI at `/swagger-ui.html`)*

### 2. Run the Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev
```
*Accessible on `http://localhost:3000`*
