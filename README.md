# RESTful Web API with Node.js Framework

Web API using a Node.js Express V4 framework that will interact with the private Blockchain to submit a retrieve block chain data. 

## Getting Started

+ Clone the project on github
+ Execute: yarn install
+ Run the following command to run the application: DEBUG=myapp:* npm start
+ Access to the endpoint:
    - Finding a block: GET http://localhost:3000/block/0 
    - Creating a new block with data: POST http://localhost:3000/block
    
**GET http://localhost:3000/block/:id**

GET request to fetch a block by height parameter. 
The response for this endpoint retrieve the block object in JSON format, like this:

~~~~
{ 
"hash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3",
"height": 0,
"body": "First block in the chain - Genesis block",
"time": "1530311457",
"previousBlockHash": ""
}
~~~~
 
**POST http://localhost:3000/block**

Post a new block with data payload option to add data to the block body. The block body should support a string of text. 

~~~~
{ 
"data": "Here is my data",
}
~~~~

The response for this endpoint provide a block object in JSON format, like this.

~~~~
{ 
"hash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3",
"height": 1,
"body": "Here is my data",
"time": "1530311457",
"previousBlockHash": ""
}
~~~~

### Prerequisites

+ node --version = v10.9.0
+ npm --version = 6.4.1

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.