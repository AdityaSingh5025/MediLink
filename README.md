# MediLink

MediLink is a web platform designed to facilitate the donation and request of medicines and medical equipment. It connects donors with those in need, ensuring that unused medical resources find a second life rather than going to waste.

## Features

- **Resource Listings**: Users can list available medicines (with expiry tracking) and medical equipment.
- **Geolocation**: Listings include location data for finding nearby resources.
- **Request System**: Users can request listed items, optionally providing prescription documentation.
- **Real-time Chat**: Integrated socket.io-based chat for direct communication between donors and requesters.
- **Leaderboard**: Gamification element to recognize top contributors.
- **Authentication**: Secure user authentication with JWT.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS, Radix UI
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form with Zod/Yup validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO
- **Image Storage**: Cloudinary
- **Email**: Nodemailer

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- **Docker & Docker Compose** (for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediLink
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   FRONTEND_URLS=http://localhost:3000
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

## Docker Setup

You can run the entire stack (Frontend, Backend, and MongoDB) using Docker Compose:

1. **Environment Config**: Ensure your `.env` files are configured in the `server` and `frontend` directories.
2. **Build and Run**:
   ```bash
   docker-compose up --build
   ```
   - **Frontend**: Available at `http://localhost:3000`
   - **Backend**: Available at `http://localhost:5000`
   - **Database**: Runs inside a container named `medilink-db`

## Folder Structure

- `frontend/`: React application source code.
  - `src/modules/`: Feature-based modules (Auth, Chat, Listing, etc.)
  - `src/core/`: Core configurations and providers.
  - `src/shared/`: Reusable components and utilities.
- `server/`: Express backend source code.
  - `src/models/`: Mongoose schemas.
  - `src/controllers/`: Route logic.
  - `src/routes/`: API endpoint definitions.
  - `src/config/`: Database and service configurations.
  - `src/middleware/`: Authentication and role-based access logic.
  - `src/utils/`: Shared helper functions and utilities.
