class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }
}

class Block {
  constructor(index, timestamp, transactions, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  async calculateHash() {
    return await sha256(
      this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce
    );
  }

  async mineBlock(difficulty) {
    do {
      this.nonce++;
      this.hash = await this.calculateHash();
    } while (this.hash.substring(0, difficulty) !== "0".repeat(difficulty));
    return this.hash;
  }
}

class Blockchain {
  constructor() {
    this.chain = [new Block(0, Date.now(), "Genesis Block", "0")];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 50;
  }

  async minePendingTransactions(minerAddress) {
    let block = new Block(this.chain.length, Date.now(), this.pendingTransactions, this.chain[this.chain.length - 1].hash);
    await block.mineBlock(this.difficulty);
    this.chain.push(block);

    this.pendingTransactions = [new Transaction(null, minerAddress, this.miningReward)];
  }

  createTransaction(tx) {
    this.pendingTransactions.push(tx);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      if (Array.isArray(block.transactions)) {
        for (const tx of block.transactions) {
          if (tx.from === address) balance -= tx.amount;
          if (tx.to === address) balance += tx.amount;
        }
      }
    }
    return balance;
  }
}

// 🔑 Wallet generator
function generateWallet() {
  myWallet = "WALLET-" + Math.random().toString(36).substring(2, 10);
  document.getElementById("wallet").innerText = "💳 " + myWallet;
  updateBalance();
}

let myWallet = null;
const myCoin = new Blockchain();

async function sendTx() {
  if (!myWallet) return alert("Generate wallet first!");
  let to = document.getElementById("to").value;
  let amount = parseInt(document.getElementById("amount").value);

  if (!to || !amount) return alert("Enter receiver and amount");

  myCoin.createTransaction(new Transaction(myWallet, to, amount));
  alert("✅ Transaction added! Mine to confirm.");
}

async function mine() {
  if (!myWallet) return alert("Generate wallet first!");
  document.getElementById("status").innerText = "⛏️ Mining...";
  await myCoin.minePendingTransactions(myWallet);
  document.getElementById("status").innerText = "🎉 Block mined!";
  updateBalance();
  document.getElementById("chain").innerText = JSON.stringify(myCoin, null, 2);
}

function updateBalance() {
  if (myWallet) {
    document.getElementById("balance").innerText =
      "💰 Balance: " + myCoin.getBalanceOfAddress(myWallet) + " Coins";
  }
}

// Simple SHA256
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
