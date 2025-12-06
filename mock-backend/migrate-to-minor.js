const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
const BAK_FILE = path.join(__dirname, 'db.json.bak');

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

function majorToMinor(amountMajor, currency) {
  const d = decimalsFor(currency);
  return Math.round(amountMajor * Math.pow(10, d));
}

function isFloat(n) {
  return Number(n) === n && n % 1 !== 0;
}

function migrate() {
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const db = JSON.parse(raw);
  fs.writeFileSync(BAK_FILE, raw);
  let changed = false;

  (db.wallets || []).forEach(w => {
    (w.balances || []).forEach(b => {
      if (typeof b.amount === 'number' && isFloat(b.amount)) {
        const old = b.amount;
        b.amount = majorToMinor(b.amount, b.currency);
        console.log(`Converted wallet ${w.id} balance ${b.currency}: ${old} -> ${b.amount}`);
        changed = true;
      }
    });
  });

  (db.transactions || []).forEach(t => {
    if (typeof t.amount === 'number' && isFloat(t.amount)) {
      const old = t.amount;
      t.amount = majorToMinor(t.amount, t.currency);
      console.log(`Converted tx ${t.id} ${t.currency}: ${old} -> ${t.amount}`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log('Migration applied and backup saved to db.json.bak');
  } else {
    console.log('No changes required. Backup saved to db.json.bak');
  }
}

migrate();
