# ConCompanyApp

## Project Description
ConCompanyApp is a project management application designed to streamline the management of employees, projects, and their associated data. The application features a frontend built with Next.js and a backend powered by Node.js and Prisma for database interactions.

---

## API Endpoints

### Backend Endpoints

| Method | Endpoint                          | Description                                      |
|--------|-----------------------------------|--------------------------------------------------|
| GET    | /api/employees                   | Fetch all employees.                            |
| POST   | /api/employees                   | Add a new employee.                             |
| PUT    | /api/employees/:id               | Update an employee by ID.                       |
| DELETE | /api/employees/:id               | Delete an employee by ID.                       |
| GET    | /api/projects                    | Fetch all projects.                             |
| POST   | /api/projects                    | Add a new project.                              |
| PUT    | /api/projects/:id                | Update a project by ID.                         |
| DELETE | /api/projects/:id                | Delete a project by ID.                         |
| PUT    | /api/project-employees/:id       | Update project-employee relations (rate, days). |

These are the endpoints for the moments since the app is still getting coded!
---

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)
- PostgreSQL (or any database supported by Prisma)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the database:
   - Update the `DATABASE_URL` in the `.env` file with your database connection string.
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database (optional):
   ```bash
   node seed.js
   ```
6. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at:
   ```
   http://localhost:3000
   ```

---

## Notes
- Ensure the backend server is running before accessing the frontend.
- Update the API base URL in the frontend `api.ts` service file if the backend is hosted on a different domain or port.