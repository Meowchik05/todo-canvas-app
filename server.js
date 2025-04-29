const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
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
        const id = Number(req.params.id);
        const userId = req.query.userId;
        
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const result = await collection.deleteOne({ id, userId });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.json({ success: true });
      } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ error: 'Failed to delete expense' });
      }
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