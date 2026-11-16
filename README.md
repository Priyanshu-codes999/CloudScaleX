# CloudScale X – Hybrid Cloud Deployment & Cost Optimization Platform

CloudScale X is a hybrid cloud management platform designed to simplify workload management, infrastructure placement analysis, and cloud cost optimization.

The platform allows users to register application workloads by specifying their resource requirements, including CPU cores, RAM, expected users, and monthly budget. Based on configurable placement rules, it provides recommendations for deploying workloads on local infrastructure or AWS and presents estimated infrastructure costs.

The application uses a modern full-stack architecture with React and TypeScript on the frontend, Java Spring Boot on the backend, and PostgreSQL for persistent data storage. Docker containerizes the application, while Kubernetes manages the deployment of the frontend, backend, and database services.

### Key Features
- Workload registration and management (CRUD operations).
- Rule-based infrastructure placement recommendations.
- Local infrastructure vs AWS placement analysis.
- Monthly workload budget and cost estimation.
- REST API integration using Spring Boot.
- Persistent PostgreSQL database.
- Docker-based containerization.
- Kubernetes-based application deployment.

### Technology Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Java 21, Spring Boot
- **Database:** PostgreSQL
- **Containerization:** Docker
- **Orchestration:** Kubernetes, Minikube
- **Build Tool:** Maven

### Current Development Status
The core platform is implemented and deployed locally using Kubernetes. Workload management, database integration, placement recommendations, and cost estimation are functional.

### Future Enhancements
- AI/ML-based workload placement recommendations.
- Predictive resource allocation.
- Intelligent cloud cost optimization.
- Advanced infrastructure monitoring.

**Note:** Placement decisions currently use rule-based logic, and cost figures are illustrative estimates rather than live AWS pricing.
