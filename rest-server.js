const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');


const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

var allSockets = [];
io.on("connection", (socket) => {

    allSockets.push(socket);
    console.log("Client connected...");
    socket.emit("data", "Some data...");
})


var customers = [];

function initData(){
    customers.push({id: 1, name: "Google", location: "Bangalore"});
    customers.push({id: 2, name: "Microsoft", location: "Hyderabad"});
    customers.push({id: 3, name: "Apple", location: "Bangalore"});
    customers.push({id: 4, name: "Reliance", location: "Mumbai"});
}

initData();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.get("/", (req, resp)=> {
    resp.status(200);
    resp.write("Node Express REST API's");
    resp.end();
})

app.get("/customers", (req, resp)=> {

    resp.json(customers);

});

app.get("/customers/:id", (req, resp) => {

    var id = parseInt(req.params.id);
    var filteredCustomers =  customers.filter((item) => item.id === id);
    if(filteredCustomers[0]){
        resp.json(filteredCustomers[0]);
    }else{
        resp.status(404);
        resp.json(null);
    }
})

app.post("/customers", (req, resp)=>{

    
    var customer = req.body;
    try {
        if(customer.id <= 0){
            //Bad Request
            resp.status(400);
            resp.json(null);
        }
        else{
            customers.push(customer);

            allSockets.forEach(socket => {
                socket.emit("newCustomer", customer);
            })

            resp.status(201);
            resp.setHeader("location", "customers/" + customer.id);
            resp.json(null);
        }
    } catch (error) {
        resp.status(503);
        resp.json(null);
    }
    
})

// app.listen(8090, () => {
//     console.log("REST API server started");
// });

var port = process.env.PORT || 8090
httpServer.listen(port, () => {
    console.log("REST API server started");
});