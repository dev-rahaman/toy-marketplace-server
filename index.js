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

app.get("/toySearchByName/:text", async (req, res) => {
  const searchText = req.params.text;
  const result = await toysCollection
    .find({
      $or: [{ name: { $regex: searchText, $options: "i" } }],
    })
    .toArray();
  res.send(result);
});

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
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });

    // sort with ascending
    app.get("/ascending", async (req, res) => {
      const result = await toysCollection.find().sort({ price: 1 }).toArray();
      res.send(result);
    });

    // sort with Descending
    app.get("/descending", async (req, res) => {
      const result = await toysCollection.find().sort({ price: -1 }).toArray();
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

    app.get("/mytoys/:text", async (req, res) => {
      const result = await toysCollection
        .find({ subcategory: req.params.text })
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

    // update data with id accordion**********
    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          name: body.name,
          subcategory: body.subcategory,
          price: body.price,
          rating: body.rating,
          sellerName: body.sellerName,
          email: body.email,
          photo: body.photo,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedDoc);
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
