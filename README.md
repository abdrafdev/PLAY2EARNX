🎮 Play2EarnX

A decentralized gaming platform powered by Ethereum & Next.js.

📌 Overview

Play2EarnX is a blockchain-based play-to-earn gaming platform. It uses a Solidity smart contract (Play2EarnX.sol) deployed on Ethereum-compatible networks, ensuring transparent game creation, invitations, scoring, and payouts.

The project leverages Next.js + TypeScript + TailwindCSS for the frontend, with Hardhat + Ethers.js handling blockchain interactions.

⚙️ System Requirements

💻 CPU: 4+ cores

🧠 RAM: 16 GB+

🌐 Internet: 10 Mbit/s+

📧 Information

Email: abdrafdev@gmail.com

🚀 Key Features

🎮 Game Management

createGame: Create a new game.

deleteGame: Remove a game (only by owner).

👫 Invitations

invitePlayer: Invite a player.

acceptInvitation: Accept an invitation.

rejectInvitation: Reject an invitation.

🏆 Gameplay & Results

saveScore: Save a player’s score.

payout: Distribute winnings fairly.

🔑 Smart Contract Structures

GameStruct → Represents a game.

PlayerStruct → Represents a player.

InvitationStruct → Represents invitations.

ScoreStruct → Represents scoring.

🛠 Running the Application

1️⃣ Configure your environment by creating a .env file with:

NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_ALCHEMY_ID=<YOUR_ALCHEMY_PROJECT_ID>
NEXT_PUBLIC_PROJECT_ID=<WALLET_CONNECT_PROJECT_ID>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=somereallysecretsecret


👉 Get keys:

Alchemy

WalletConnect

2️⃣ Install dependencies:

yarn install


3️⃣ Start the Next.js development server:

yarn dev


✅ Your application should now be running at http://localhost:3000
.

📚 Key Technologies

🌐 Next.js – React framework

📘 TypeScript – Type safety

📦 Hardhat – Ethereum smart contract development

👀 Ethers.js – Blockchain interaction

📚 Redux Toolkit – State management

🎨 TailwindCSS – Styling framework

🔗 OpenZeppelin – Secure smart contract standards

🔗 Useful Links

🏠 Website

⚽ MetaMask

💡 Hardhat

📈 Alchemy

🔥 Next.js

🎅 TypeScript

🐻 Solidity

👀 Ethers.js



✨ Play. Earn. Own the future of decentralized gaming with Play2EarnX.