// --- Dependencies ---
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ysjwzre.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("plateshareDB");
    console.log("MongoDB Connected Successfully!");

    const usersCollection = db.collection("users");
    const foodsCollection = db.collection("foods");
    const requestsCollection = db.collection("requests");

    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        if (!newUser.email) {
          return res.status(400).send({ error: "Email is required" });
        }

        const exists = await usersCollection.findOne({ email: newUser.email });

        if (exists) {
          return res.send({ message: "User already exists" });
        }

        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.get("/foods", async (req, res) => {
      try {
        const result = await foodsCollection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.get("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await foodsCollection.findOne({ _id: new ObjectId(id) });

        if (!result) {
          return res.status(404).send({ message: "Food not found" });
        }

        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.post("/foods", async (req, res) => {
      try {
        const newFood = req.body;
        newFood.createdAt = new Date();

        const result = await foodsCollection.insertOne(newFood);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.patch("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const updateDoc = {
          $set: updateData,
        };

        const result = await foodsCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.delete("/foods/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await foodsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.post("/requests", async (req, res) => {
      try {
        const newRequest = req.body;

        newRequest.createdAt = new Date();
        newRequest.status = "pending";

        const result = await requestsCollection.insertOne(newRequest);
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.get("/requests", async (req, res) => {
      try {
        const filter = {};

        if (req.query.foodId) filter.foodId = req.query.foodId;
        if (req.query.email) filter.requester_email = req.query.email;

        const result = await requestsCollection.find(filter).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.patch("/requests/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const status = req.body.status;

        if (!status) {
          return res.status(400).send({ error: "Status is required" });
        }

        const result = await requestsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });


    app.get("/", (req, res) => {
      res.send("PlateShare API Server Running...");
    });
  } catch (error) {
    console.log("Error:", error.message);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
