const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const uri = "mongodb+srv://sber:123@cluster0.wvbm5rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "myDatabase";
const collectionName = "expenses";

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // API endpoints
    app.get('/api/expenses', async (req, res) => {
      try {
        const userId = req.query.userId;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const expenses = await collection.find({ userId }).toArray();
        res.json(expenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
      }
    });

    app.post('/api/expenses', async (req, res) => {
      try {
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const newExpense = {
          ...req.body,
          createdAt: new Date()
        };
        
        const result = await collection.insertOne(newExpense);
        const insertedExpense = {
          ...req.body,
          _id: result.insertedId
        };
        
        res.status(201).json(insertedExpense);
      } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ error: 'Failed to add expense' });
      }
    });

    app.delete('/api/expenses/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const userId = req.query.userId;
        
        // Валидация параметров
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        if (!id || id === 'undefined') {
          return res.status(400).json({ error: 'Valid Task ID is required' });
        }

        // Преобразуем id в число (если нужно)
        const numericId = isNaN(id) ? id : Number(id);

        const result = await collection.deleteOne({ 
          id: numericId, 
          userId 
        });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ 
            error: 'Expense not found',
            details: `No expense found with id: ${numericId} for user: ${userId}`
          });
        }
        
        res.json({ 
          success: true,
          deletedId: numericId
        });
      } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ 
          error: 'Failed to delete expense',
          details: err.message 
        });
      }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

run();
