# Online Examination System — Java Full Stack

A beginner-friendly full-stack project with separate `frontend/` and `backend/` folders.

## Technology
- Frontend: React + Vite + CSS
- Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA
- Database: H2 file database (easy local setup; data persists between local restarts)
- API: REST/JSON

## Features
- Dashboard summary
- Create, read, update, and delete (CRUD) exams
- Create, read, update, and delete questions
- Take an exam and calculate a score
- Sample exam/questions are inserted automatically when the backend starts
- Responsive layout

> GitHub stores your source code; it does not run the Java backend or database by itself. Push this project to GitHub, then deploy the frontend and backend separately if your instructor needs public live links. For a quick college demo, run both locally and submit the GitHub repository link plus (if required) deployed links.

## Requirements
- JDK 17 or newer
- Node.js 18 or newer
- Internet connection on first run so Maven/npm can download dependencies
- Git (optional but recommended)

## 1. Start the backend
Open a terminal in the project folder:

```bash
cd backend
```

Windows:
```powershell
.\mvnw.cmd spring-boot:run
```

If the Maven wrapper cannot run or is not included in your environment, install Maven and run:
```bash
mvn spring-boot:run
```

Backend URL: http://localhost:8080  
H2 console: http://localhost:8080/h2-console  
JDBC URL: `jdbc:h2:file:./data/examdb`  
Username: `sa`  
Password: leave blank

## 2. Start the frontend
Open a SECOND terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

The frontend calls the backend at `http://localhost:8080`.

## API endpoints
- `GET /api/exams` — list exams
- `POST /api/exams` — create exam
- `GET /api/exams/{id}` — get one exam
- `PUT /api/exams/{id}` — update exam
- `DELETE /api/exams/{id}` — delete exam
- `GET /api/questions` — list questions
- `POST /api/questions` — create question
- `PUT /api/questions/{id}` — update question
- `DELETE /api/questions/{id}` — delete question
- `GET /api/exams/{id}/questions` — questions for an exam
- `POST /api/exams/{id}/submit` — submit answers and calculate score

## Push to GitHub
1. Create a new empty repository on https://github.com/new named `online-examination-system`.
2. Extract this ZIP.
3. Open terminal in the extracted `online-examination-system` folder.
4. Run:

```bash
git init
git add .
git commit -m "Initial online examination system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/online-examination-system.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. The repository URL will be your first submission link.

## Important deployment note
H2 is selected to make the project easy to run locally without installing a separate database. On hosting platforms, local files may be temporary. For a durable public deployment, switch to a hosted PostgreSQL/MySQL database and set the database credentials as environment variables. The GitHub repository itself is not a running website.

## Project structure
```text
online-examination-system/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/exam/
│       │   ├── OnlineExaminationApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/ExamController.java
│       │   ├── controller/QuestionController.java
│       │   ├── controller/SubmissionController.java
│       │   ├── model/Exam.java
│       │   ├── model/Question.java
│       │   ├── repository/ExamRepository.java
│       │   ├── repository/QuestionRepository.java
│       │   └── service/DataLoader.java
│       └── resources/application.properties
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        └── styles.css
```

## Limitations / next improvements
This is a college-project starter, not a secure production exam platform. Authentication, role-based access, exam timers, randomized questions, anti-cheating controls, and production-grade validation should be added before real use.
