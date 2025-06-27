const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow frontend to fetch data
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#venkatesh018',
    database: 'Brain_out'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// API to fetch questions based on difficulty
app.get('/questions', (req, res) => {
    const difficulty = req.query.difficulty || 'easy'; // Default to easy
    const sql = "SELECT * FROM questions WHERE difficulty = ?";
    
    db.query(sql, [difficulty], (err, result) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
