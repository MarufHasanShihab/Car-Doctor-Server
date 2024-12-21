const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2iri9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollections = client.db("carDoctor").collection("services");
    const ordersCollections = client.db("carDoctor").collection("orders")

    app.get('/services',async(req,res)=>{
        const result = await servicesCollections.find().toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options = {projection:{title:1,price:1,img:1}};
      const result = await servicesCollections.findOne(query,options);
      res.send(result);
    })

    // Orders Related Apis
    app.get('/orders', async(req,res)=>{
      let query = {};
      if(req.query?.email){
        query = {loginEmail:req.query.email}
      }
      const result = await ordersCollections.find(query).toArray();
      res.send(result)
    })

    app.post('/orders',async(req,res)=>{
      const order = req.body;
      const result = await ordersCollections.insertOne(order);
      res.send(result);
    })

    app.delete('/orders/:id', async(req,res)=>{
      const query = {_id:new ObjectId(req.params.id)};
      const result = await ordersCollections.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Car Server Is Running');
})

app.listen(port, ()=>{
    console.log(`car server is running in ${port}`);
})