# Decentralized Escrow System

A decentralized escrow platform built to enable secure, trustless freelance payments using Web3 technology and smart contracts. This system ensures that funds are securely held in escrow until all project milestones or conditions are met, protecting both freelancers and clients from fraud.

## 🚀 Key Features

- **Trustless Payments:** Smart contracts handle the release of funds automatically when predefined conditions are met.
- **Secure Authentication:** JWT-based user authentication combined with Web3 wallet integration (via Ethers.js).
- **Gig & Milestone Management:** Easily create, track, and manage gigs and payment milestones.
- **Modern User Interface:** A fast, responsive, and intuitive UI built with React and Tailwind CSS.
- **RESTful API Backend:** Robust Express.js backend connected to MongoDB for handling user data, gig metadata, and transaction history.

## 💻 Tech Stack

### Frontend
- **React (v19):** Modern component-based UI framework.
- **Vite:** Next-generation frontend tooling for fast development and build times.
- **Tailwind CSS (v4):** Utility-first CSS framework for rapid UI styling.
- **React Router DOM:** Declarative routing for React applications.
- **Ethers.js:** For interacting with the Ethereum Blockchain and smart contracts.
- **Lucide React:** Beautiful and consistent iconography.
- **Axios:** Promise-based HTTP client for API requests.

### Backend
- **Node.js:** JavaScript runtime environment.
- **Express.js (v5):** Fast, unopinionated web framework for building APIs.
- **MongoDB & Mongoose:** NoSQL database and Object Data Modeling (ODM) library for flexible data storage.
- **Ethers.js:** Backend blockchain interaction and signature verification.
- **JSON Web Tokens (JWT):** Secure session and authentication management.
- **dotenv & CORS:** Configuration management and Cross-Origin Resource Sharing middleware.

## 🎨 UI Design

The user interface of the Escrow System focuses on delivering a **premium, clean, and intuitive** experience. 
- **Modern Aesthetics:** Utilizes a sleek color palette, crisp typography, and responsive layouts powered by Tailwind CSS.
- **Responsive Layout:** fully optimized for both desktop and mobile devices, ensuring accessibility anywhere.
- **Visual Feedback:** Incorporates `react-hot-toast` for elegant, non-intrusive notifications and `lucide-react` icons for clear visual cues.
- **Web3 First:** Designed with Web3 UX in mind, offering seamless wallet connection prompts and transaction status indicators.

## 📁 Project Structure

```text
Escrow-sys/
├── Backend/                 # Express.js REST API Server
│   ├── src/                 # Controllers, Routes, Middleware, Config
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend environment variables
│
├── Frontend/                # React & Vite Frontend Application
│   ├── src/                 # Components, Pages, Services, Assets
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
└── README.md                # Project documentation
```

## 🛠️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- A Web3 Wallet (like MetaMask) for testing transactions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory based on `.env.example` and configure your database and JWT secret.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Frontend` directory if necessary (e.g., for `VITE_API_URL`).
4. Start the frontend development server:
   ```bash
   
   npm run dev
   
   ```

## 📜 License

This project is licensed under the ISC License.
