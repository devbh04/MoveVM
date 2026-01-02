# 🚀 Zero Move

<div align="center">

**A No-CLI Platform for Movement Network Smart Contract Development**

*Empowering Web2 users to create, write, and deploy Move smart contracts with just three clicks*

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.1.0-blue.svg)](https://reactjs.org/)
[![Movement Network](https://img.shields.io/badge/network-Movement-purple.svg)](https://movementnetwork.xyz)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Step 1: Install Movement CLI](#step-1-install-movement-cli)
  - [Step 2: Setup Project](#step-2-setup-project)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Technology Stack](#-technology-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Zero Move** is a revolutionary web-based IDE that eliminates the complexity of blockchain development. It provides a seamless, intuitive interface for Web2 developers to enter the Movement Network ecosystem without needing to learn command-line tools or complex blockchain concepts.

### What Makes Zero Move Special?

- **🎨 Modern Web IDE**: Full-featured code editor with syntax highlighting and file management
- **🤖 AI-Powered Code Generation**: Generate Move smart contracts using natural language descriptions
- **⚡ Three-Click Deployment**: Initialize, compile, and deploy contracts with minimal effort
- **📊 Deployment History**: Track all your deployments with detailed transaction information
- **💾 Persistent Storage**: All projects and files are saved in MongoDB for easy access
- **🔗 Explorer Integration**: Direct links to Movement Network explorer for transactions and accounts

---

## ✨ Features

### Core Functionality

- **📝 Move Code Editor**
  - Real-time code editing with auto-save
  - Multi-file project support
  - File explorer with folder organization
  - Syntax-aware editing experience

- **🤖 AI Code Assistant**
  - Powered by Google Gemini 2.0 Flash
  - Natural language to Move code conversion
  - Context-aware code generation
  - Chat history persistence

- **🚀 Deployment Pipeline**
  - **Initialize**: Set up Movement CLI configuration
  - **Compile**: Build and validate Move contracts
  - **Deploy**: Publish contracts to Movement Network

- **📚 Project Management**
  - Create and manage multiple projects
  - Project-based file organization
  - Status tracking (Created → Initialized → Compiled → Deployed)
  - Network type selection (Testnet/Devnet/Mainnet)

- **📜 Deployment History**
  - Complete audit trail of all operations
  - Transaction hashes and explorer links
  - Error logging and debugging information
  - Timestamp tracking

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Builder    │  │   Landing    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│  ┌──────▼─────────────────▼──────┐                         │
│  │      Zustand State Store      │                         │
│  │  - Files, Code, History      │                         │
│  └──────────────────────────────┘                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Code Editor  │  │  AI Chatbot   │  │ File Explorer│    │
│  └──────────────┘  └───────────────┘  └──────────────┘    │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTP/REST API
┌───────────────────────────▼────────────────────────────────┐
│                   Backend (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Project APIs │  │ File APIs    │  │ Deploy APIs  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Movement CLI Integration Layer               │  │
│  │  - movement init                                     │  │
│  │  - movement move compile                             │  │
│  │  - movement move publish                             │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼────────┐  ┌───────▼────────┐
│   MongoDB      │  │  Filesystem  │  │ Movement CLI   │
│  - Projects    │  │  - sources/   │  │  - .movement/  │
│  - Files       │  │  - Move.toml │  │  - config.yaml │
│  - History     │  │  - build/     │  │                │
└────────────────┘  └──────────────┘  └────────────────┘
```

### Data Flow

1. **User Interaction** → React components capture user input
2. **State Management** → Zustand store manages application state
3. **API Calls** → Frontend makes HTTP requests to Express backend
4. **Business Logic** → Backend processes requests and interacts with:
   - MongoDB for data persistence
   - Filesystem for Move source files
   - Movement CLI for blockchain operations
5. **Response** → Backend returns results to frontend
6. **UI Update** → React components update based on response

### Key Components

#### Frontend Components

- **`App.tsx`**: Main router and landing page
- **`Dashboard.tsx`**: Project management interface
- **`Builder.tsx`**: Main IDE interface
- **`code-editor.tsx`**: Code editing component
- **`file-explorer.tsx`**: File management UI
- **`deployment-panel-v2.tsx`**: Deployment controls
- **`deployment-history.tsx`**: History viewer
- **`SimpleChatbot.tsx`**: AI code generation interface

#### Backend Modules

- **`index.js`**: Express server and API routes
- **`db.js`**: MongoDB schema and connection
- **Project Management**: CRUD operations for projects
- **File Management**: File operations and synchronization
- **Deployment Pipeline**: Init, compile, and deploy endpoints

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Movement CLI** (see installation guide below)
- **Rust & Cargo** (required for Movement CLI)

---

## 🚀 Installation

### Step 1: Install Movement CLI

Movement CLI is required for deploying contracts to the Movement Network. Follow these steps:

#### Prerequisites: Install Rust

```bash
curl https://sh.rustup.rs -sSf | sh
```

After installation, restart your terminal or run:
```bash
source $HOME/.cargo/env
```

#### Install Movement CLI

**For macOS (ARM64 - M-series chips):**
```bash
curl -LO https://github.com/movementlabsxyz/homebrew-movement-cli/releases/download/bypass-homebrew/movement-move2-testnet-macos-arm64.tar.gz && \
mkdir -p temp_extract && \
tar -xzf movement-move2-testnet-macos-arm64.tar.gz -C temp_extract && \
chmod +x temp_extract/movement && \
sudo mv temp_extract/movement /usr/local/bin/movement && \
rm -rf temp_extract
```

**For macOS (Intel/x86_64):**
```bash
curl -LO https://github.com/movementlabsxyz/homebrew-movement-cli/releases/download/bypass-homebrew/movement-move2-testnet-macos-x86_64.tar.gz && \
mkdir -p temp_extract && \
tar -xzf movement-move2-testnet-macos-x86_64.tar.gz -C temp_extract && \
chmod +x temp_extract/movement && \
sudo mv temp_extract/movement /usr/local/bin/movement && \
rm -rf temp_extract
```

**For Linux (x86_64):**
```bash
curl -LO https://github.com/movementlabsxyz/homebrew-movement-cli/releases/download/bypass-homebrew/movement-move2-testnet-linux-x86_64.tar.gz && \
mkdir -p temp_extract && \
tar -xzf movement-move2-testnet-linux-x86_64.tar.gz -C temp_extract && \
chmod +x temp_extract/movement && \
sudo mv temp_extract/movement /usr/local/bin/movement && \
rm -rf temp_extract
```

**For Windows:**
We recommend installing the Aptos CLI, which is compatible with Movement CLI commands:
```powershell
$Version = "7.4.0"
$ZipUrl = "https://github.com/aptos-labs/aptos-core/releases/download/aptos-cli-v$Version/aptos-cli-$Version-Windows-x86_64.zip"
$InstallDir = "$env:USERPROFILE\.aptoscli\bin"
$ZipPath = "$env:TEMP\aptos-cli.zip"

Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# Set PATH
$CurrentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($CurrentPath -notlike "*$InstallDir*") {
    setx PATH "$CurrentPath;$InstallDir"
    Write-Host "`n✅ PATH updated. Please restart your terminal before running 'aptos'."
} else {
    Write-Host "`n✅ PATH already configured."
}
```

**Verify Installation:**
```bash
movement --version
```

You should see `movement 7.4.0` or similar.

> 📖 For more details, visit the [official Movement CLI documentation](https://docs.movementnetwork.xyz/devs/movementcli)

---

### Step 2: Setup Project

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd encode-club-movement-hack
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

#### 4. Setup MongoDB

Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

**Or use MongoDB Atlas:**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/zeromove
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zeromove

# Movement Project Directory (optional, defaults to ./app/aptos)
MOVEMENT_DIR=./app/aptos
```

### Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
# Google Gemini API Key for AI Code Generation
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Important**: Never commit `.env` files to version control. They are already included in `.gitignore`.

---

## 🎮 Usage

### Starting the Application

#### 1. Start MongoDB (if using local instance)

```bash
# macOS/Linux
mongod

# Or if installed via Homebrew
brew services start mongodb-community
```

#### 2. Start the Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:3000`

#### 3. Start the Frontend Development Server

In a new terminal:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### Using the Application

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - You'll see the landing page with project statistics

2. **Create a New Project**
   - Click "INITIALIZE SYSTEM" or navigate to Dashboard
   - Click "New Project" button
   - Enter a project name and press Enter

3. **Write Your Contract**
   - The project opens in the Builder interface
   - Write Move code manually in the editor, OR
   - Click the Bot icon to use AI code generation
   - Describe your contract in natural language
   - The AI will generate Move code for you

4. **Deploy Your Contract**
   - **Initialize**: Sets up Movement CLI configuration (first time only)
   - **Compile**: Validates and builds your Move contract
   - **Deploy**: Publishes your contract to Movement Network

5. **View History**
   - Click "History" tab to see all deployment operations
   - View transaction hashes, explorer links, and error logs

### Example: Creating a Simple Counter Contract

1. Create a new project named "Counter"
2. Use AI chatbot or manually write:
```move
module 0x1::counter {
    use std::signer;
    
    struct Counter has key {
        value: u64,
    }
    
    public entry fun initialize(account: &signer) {
        move_to(account, Counter { value: 0 });
    }
    
    public entry fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }
    
    public fun get_value(account: address): u64 acquires Counter {
        borrow_global<Counter>(account).value
    }
}
```

3. Click **Initialize** → **Compile** → **Deploy**
4. View your deployed contract in the explorer!

---

## 📁 Project Structure

```
encode-club-movement-hack/
│
├── backend/                    # Node.js/Express Backend
│   ├── app/
│   │   └── aptos/              # Movement project directory
│   │       ├── sources/         # Move source files
│   │       ├── Move.toml        # Move package config
│   │       └── .movement/       # Movement CLI config
│   ├── db.js                   # MongoDB schema and connection
│   ├── index.js                # Express server and API routes
│   ├── package.json
│   └── .env                    # Backend environment variables
│
├── client/                     # React Frontend
│   ├── public/
│   │   └── templates/          # Move contract templates
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── code-editor.tsx
│   │   │   ├── file-explorer.tsx
│   │   │   ├── deployment-panel-v2.tsx
│   │   │   ├── deployment-history.tsx
│   │   │   ├── SimpleChatbot.tsx
│   │   │   └── ui/             # UI component library
│   │   ├── pages/              # Page components
│   │   │   ├── Builder.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── store/               # Zustand state management
│   │   │   └── builderStore.ts
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── .env                    # Frontend environment variables
│
└── Readme.md                   # This file
```

---

## 🔌 API Endpoints

### Project Management

- `GET /projects` - Get all projects
- `GET /projects/:id` - Get single project
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### File Management

- `GET /projects/:id/files` - Get all files for a project
- `POST /projects/:id/files` - Add or update a file
- `DELETE /projects/:id/files/:fileName` - Delete a file
- `GET /projects/:id/sync-files` - Sync files from filesystem

### Deployment

- `POST /init` - Initialize Movement CLI
- `POST /compile` - Compile Move contract
- `POST /deploy` - Deploy Move contract
- `GET /projects/:id/history` - Get deployment history

### Integration

- `GET /integration-functions` - Generate TypeScript integration code

---

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database (via Mongoose)
- **YAML** - Config parsing
- **dotenv** - Environment variables

### External Services
- **Movement CLI** - Blockchain operations
- **Google Gemini API** - AI code generation
- **Movement Network** - Blockchain network

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Movement Network](https://movementnetwork.xyz) for the blockchain infrastructure
- [Movement Labs](https://movementlabs.xyz) for the Movement CLI
- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI capabilities
- The open-source community for amazing tools and libraries

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the [Movement Network Documentation](https://docs.movementnetwork.xyz)
- Review the [Movement CLI Documentation](https://docs.movementnetwork.xyz/devs/movementcli)

---

<div align="center">

**Built with ❤️ for the Movement Network ecosystem**

[⬆ Back to Top](#-zero-move)

</div>

