const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    console.log('server is commingg');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bswbr7l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const services = client.db('carMechanic').collection('services');
    const bookingCollection = client.db('carMechanic').collection('booking');
    // user token 
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user,process.env.ACCESS_TOKEN,{ expiresIn: '1h' })
        console.log(token);
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            sameSite:'none'
        })
        .send({sucess:true});
    })

    app.get('/services',async(req,res)=>{
        const cursor =  services.find();
        const result = await cursor.toArray();
        // console.log(result)
        res.send(result);

    })
    app.get('/checkout',async(req,res)=>{
        let query = {}
        if(req.query?.email){
            query={email:req.query.email}
        };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
    })
    app.post('/checkout',async(req,res)=>{
        const orderInfo = req.body;
        const result = await bookingCollection.insertOne(orderInfo);
        // console.log(result);
        res.send(result); 
    })
    app.delete('/checkout/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}
        const result = await bookingCollection.deleteOne(query);
        // console.log(result);
        res.send(result); 
    })
    app.get('/services/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const option = {
            projection:{title:1,price:1,service_id:1},
        };
        const result = await services.findOne(query,option);
        // console.log(result);
        res.send(result);
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

app.listen(port,()=>{
    console.log(`running port${port}`);
})