# Escrow-sys
A decentralized escrow system that enables secure, trustless freelance payments using smart contracts.

Files structure:
trustless-freelance-escrow/
│
├── /blockchain               # Hardhat project for Smart Contracts
│   ├── /contracts
│   │   ├── Escrow.sol        # Core escrow logic (deposit, release, refund)
│   │   └── EscrowFactory.sol # Factory to deploy unique escrows per gig
│   ├── /scripts
│   │   └── deploy.js         # Deployment scripts for testnets (Polygon/Sepolia)
│   ├── /test
│   │   └── Escrow.test.js    # Unit tests for your contracts (Crucial for resume!)
│   └── hardhat.config.js     # Network and compiler configurations
│
├── /backend                  # Node.js + Express + MongoDB
│   ├── /src
│   │   ├── /config           # DB connection and environment variables
│   │   ├── /controllers      # Logic for routes (e.g., user logic, gig creation)
│   │   ├── /models           # Mongoose schemas (User, Gig, EscrowMetadata)
│   │   ├── /routes           # API endpoints (e.g., /api/users, /api/gigs)
│   │   ├── /middlewares      # Auth verification (JWT), error handling
│   │   └── server.js         # Express app entry point
│   └── package.json
│
├── /frontend                 # React.js (Recommend using Vite for speed)
│   ├── /src
│   │   ├── /assets           # Images, icons, global styles
│   │   ├── /components       # Reusable UI (Navbar, Button, EscrowCard, ConnectWallet)
│   │   ├── /context          # React Context (Web3Context for MetaMask, AuthContext)
│   │   ├── /pages            # Route views (Home, Dashboard, CreateGig, EscrowDetails)
│   │   ├── /services         # API calls to your backend (axios fetchers)
│   │   ├── /utils            # Helper functions (formatEthers, truncateAddress)
│   │   ├── /abis             # Contract ABIs (copied from /blockchain/artifacts)
│   │   └── App.jsx           # Main React component & Router
│   └── package.json
│
├── .gitignore
└── README.md                 # Project overview, setup instructions, architecture diagram
