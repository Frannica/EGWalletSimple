const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = process.env.PORT || 4000;

// Currency decimals map (minor units)
const currencyDecimals = {
  USD: 2,
  EUR: 2,
  NGN: 2,
  XAF: 2,
  GHS: 2,
  ZAR: 2,
  CNY: 2,
};

function decimalsFor(currency) {
  return currencyDecimals[currency] || 2;
}

function minorToMajor(amountMinor, currency) {
  const d = decimalsFor(currency);
  return amountMinor / Math.pow(10, d);
}

function majorToMinor(amountMajor, currency) {
  const d = decimalsFor(currency);
  return Math.round(amountMajor * Math.pow(10, d));
}

function loadDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    const initial = {
      users: [],
      wallets: [],
      transactions: [],
      rates: {
        base: 'USD',
        values: { USD: 1, EUR: 0.93, NGN: 1540, XAF: 600, GHS: 12, ZAR: 19, CNY: 7 },
        updatedAt: Date.now()
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
function findUserByEmail(db, email) {
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth
app.post('/auth/register', (req, res) => {
  const db = loadDB();
  const { email, password, region } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (findUserByEmail(db, email)) return res.status(400).json({ error: 'User exists' });

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = { id, email, region: region || 'US', createdAt: Date.now() };
  db.users.push({ ...user, passwordHash });

  // create wallet
  const wallet = { id: uuidv4(), userId: id, balances: [{ currency: 'USD', amount: 0 }], createdAt: Date.now(), maxLimitUSD: 250000 };
  db.wallets.push(wallet);

  saveDB(db);

  const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: user, walletId: wallet.id });
});

app.post('/auth/login', (req, res) => {
  const db = loadDB();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const u = findUserByEmail(db, email);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, u.passwordHash)) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: u.id, email: u.email, region: u.region } });
});

// Wallet endpoints
app.get('/wallets/:id/balance', authMiddleware, (req, res) => {
  const db = loadDB();
  const wallet = db.wallets.find(w => w.id === req.params.id && w.userId === req.user.userId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json({ balances: wallet.balances, maxLimitUSD: wallet.maxLimitUSD });
});

// List wallets for authenticated user
app.get('/wallets', authMiddleware, (req, res) => {
  const db = loadDB();
  const wallets = db.wallets.filter(w => w.userId === req.user.userId);
  res.json({ wallets });
});

app.get('/wallets/:id/transactions', authMiddleware, (req, res) => {
  const db = loadDB();
  const wallet = db.wallets.find(w => w.id === req.params.id && w.userId === req.user.userId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  const txs = db.transactions.filter(t => t.fromWalletId === wallet.id || t.toWalletId === wallet.id).sort((a,b)=>b.timestamp-a.timestamp);
  res.json({ transactions: txs });
});

// Send money (simple internal transfer between wallets by walletId)
app.post('/transactions', authMiddleware, (req, res) => {
  const db = loadDB();
  const { fromWalletId, toWalletId, amount, currency, memo } = req.body; // amount is expected in minor units (integer)
  if (!fromWalletId || !toWalletId || typeof amount === 'undefined' || !currency) return res.status(400).json({ error: 'missing fields' });

  const fromWallet = db.wallets.find(w => w.id === fromWalletId && w.userId === req.user.userId);
  if (!fromWallet) return res.status(404).json({ error: 'Source wallet not found' });
  const toWallet = db.wallets.find(w => w.id === toWalletId);
  if (!toWallet) return res.status(404).json({ error: 'Destination wallet not found' });
  // find balance entries (amount stored in minor units)
  const fromBalance = fromWallet.balances.find(b=>b.currency===currency) || { currency, amount: 0 };
  if (fromBalance.amount < amount) return res.status(400).json({ error: 'Insufficient funds' });

  // enforce max wallet limit (USD equivalent) for destination
  const rates = db.rates.values;
  // Convert amount minor -> major then to USD
  const amountMajor = minorToMajor(amount, currency);
  const toAmountInUSD = amountMajor / (rates[currency] || 1);
  const destTotalUSD = toWallet.balances.reduce((s,b)=>{
    const bMajor = minorToMajor(b.amount, b.currency);
    return s + (bMajor / (rates[b.currency] || 1));
  },0) + toAmountInUSD;
  if (destTotalUSD > (toWallet.maxLimitUSD||250000)) return res.status(400).json({ error: 'Destination wallet would exceed max limit' });

  // apply transfer (minor units)
  fromBalance.amount -= amount;
  const destBalance = toWallet.balances.find(b=>b.currency===currency);
  if (destBalance) destBalance.amount += amount; else toWallet.balances.push({ currency, amount });

  const tx = { id: uuidv4(), fromWalletId, toWalletId, amount, currency, memo: memo||'', status: 'completed', timestamp: Date.now() };
  db.transactions.push(tx);
  saveDB(db);

  res.json({ transaction: tx });
});

// Rates
app.get('/rates', (req, res) => {
  const db = loadDB();
  res.json(db.rates);
});

// Basic user info
app.get('/me', authMiddleware, (req, res) => {
  const db = loadDB();
  const u = db.users.find(x=>x.id===req.user.userId);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ id: u.id, email: u.email, region: u.region });
});

app.listen(PORT, () => {
  console.log(`EGWallet mock backend running on http://localhost:${PORT}`);
});
