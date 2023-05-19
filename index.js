const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv").config();
const app = express();
const port = process.env.PORT || 8080;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

const uri = `mongodb+srv://${process.env.USER_KEY}:${process.env.PASS_KEY}@cluster0.bk91ias.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const toysCollection = client.db("aliveBaby").collection("toys");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();

    // send data on server database
    app.post("/addtoy", async (req, res) => {
      const cursor = req.body;
      const result = await toysCollection.insertOne(cursor);
      res.send(result);
    });

    // read all data from server database
    app.get("/alltoys", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    // read one data from database
    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // read data with email accordion
    app.get("/mytoys/:email", async (req, res) => {
      const result = await toysCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // delete data with id accordion
    app.delete("/mytoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // app.get("/mytoys/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const options = {
    //     projection: {
    //       name: 1,
    //       subcategory: 1,
    //       price: 1,
    //       ratings: 1,
    //       sellerName: 1,
    //       email: 1,
    //       photo: 1,
    //       quantity: 1,
    //       description: 1,
    //     },
    //   };
    //   const result = await toysCollection.findOne(query, options);
    //   res.send(result);
    // });

    // modifiedCount

    // update data with id accordion**********
    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updated = req.body;

      const updateDoc = {
        $set: {
          name: updated.name,
          _id: updated._id,
          subcategory: updated.subcategory,
          price: updated.price,
          rating: updated.rating,
          sellerName: updated.sellerName,
          email: updated.email,
          photo: updated.photo,
          quantity: updated.quantity,
          description: updated.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`baby alive on running on port ${port}`);
});
