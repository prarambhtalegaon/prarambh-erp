const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// 1. DATABASE CONNECTION (प्रारंभ मेन्सवेअर डेटाबेस)
const db = new sqlite3.Database('./prarambh_erp.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to Prarambh ERP Database successfully.');
    }
});

// 2. CREATE TABLES (टेबल्स तयार करणे)
db.serialize(() => {
    // अ) उत्पादने / स्टॉक टेबल (Products / Stock Table)
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT UNIQUE,
        category TEXT,
        style TEXT,
        size TEXT,
        mrp REAL,
        stock_qty INTEGER
    )`);

    // ब) ग्राहक टेबल (Customers Table)
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        mobile TEXT UNIQUE,
        age_group TEXT,
        gender TEXT
    )`);

    // क) बिल / सेल्स टेबल (Sales / Bills Table)
    db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_no TEXT UNIQUE,
        date TEXT,
        customer_mobile TEXT,
        salesman_id TEXT,
        total_qty INTEGER,
        total_amount REAL,
        payment_mode TEXT
    )`);
});

// 3. API ENDPOINTS

// सर्व प्रॉडक्ट्स मिळवणे
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// बारकोडवरून प्रॉडक्ट शोधणे
app.get('/api/products/:barcode', (req, res) => {
    const { barcode } = req.params;
    db.get('SELECT * FROM products WHERE barcode = ?', [barcode], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(row || { message: 'Product not found' });
    });
});

// नवीन प्रॉडक्ट/स्टॉक जोडणे
app.post('/api/products', (req, res) => {
    const { barcode, category, style, size, mrp, stock_qty } = req.body;
    db.run(
        `INSERT INTO products (barcode, category, style, size, mrp, stock_qty) VALUES (?, ?, ?, ?, ?, ?)`,
        [barcode, category, style, size, mrp, stock_qty],
        function (err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ id: this.lastID, message: 'Product added successfully' });
        }
    );
});

// बिल सेव्ह करणे
app.post('/api/sales', (req, res) => {
    const { bill_no, date, customer_mobile, salesman_id, total_qty, total_amount, payment_mode } = req.body;
    db.run(
        `INSERT INTO sales (bill_no, date, customer_mobile, salesman_id, total_qty, total_amount, payment_mode) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bill_no, date, customer_mobile, salesman_id, total_qty, total_amount, payment_mode],
        function (err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ id: this.lastID, message: 'Sale recorded successfully' });
        }
    );
});

// सर्व्हर सुरू करणे
app.listen(PORT, () => {
    console.log(`Prarambh ERP Backend running at http://localhost:${PORT}`);
});