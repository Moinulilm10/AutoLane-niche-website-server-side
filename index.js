const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.96r8v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.use(cors());
app.use(express.json());



async function run() {

    try {
        await client.connect();

        console.log('database connection established...')
         

        const database = client.db("niche-web");
        const serviceCollection = database.collection("services");
        const myOrderCollection = database.collection("orders");
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

          // get services api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({})
            const services = await cursor.toArray();
            res.send(services)
        })

        // get single service api
         app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            // console.log('getting specific id', id)
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.json(service)
        })
        
        // add service
         app.post("/services", async (req, res) => {
            const service = req.body
            console.log('hit the post', service)
            const result = await serviceCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });


        // delete service api
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.deleteOne(query)
            res.json(result)
        })



        // POST order  API
        app.post('/placeOrder', async (req, res) => {
            const orderDetails = req.body;
            console.log('hit the post')
            const result = await myOrderCollection.insertOne(orderDetails);
            res.json(result);
        })

       

        // GET API (get all orders)
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = myOrderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

          // GET API (get orders by email)
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            // console.log('hit the post')
            const query = { email: email };
            // console.log(query)
            const cursor = myOrderCollection.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        })


         //DELETE  order API
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await myOrderCollection.deleteOne(query);
            res.json(result);
        })
         
        // approve order api
        app.put('/approve/:id', async (req, res) => {
            const id = req.params.id;
            const approvedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: approvedOrder.status
                },
            };
            const result = await myOrderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })


        // save user  to database
          app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // save user existing data
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


          app.put('/users/admin', async (req, res) =>{
              const user = req.body;
              console.log('put', user)
              const filter = { email: user.email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result)
          })


           app.get('/users/:email', async (req, res) => {
               const email = req.params.email;
               const query = { email: email };
               const user = await usersCollection.findOne(query);
               let isAdmin = false;
               if (user?.role === 'admin') {
                isAdmin = true;
                }
               res.json({ admin: isAdmin });
           })


        // add review
         app.post("/reviews", async (req, res) => {
            const service = req.body
            console.log('hit the post', service)
            const result = await reviewsCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });


        app.get('/getReviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)
        })


    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello niche web service!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})





