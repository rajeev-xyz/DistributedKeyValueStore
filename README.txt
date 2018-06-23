<--------------------------------------------------Problem Statement----------------------------------------------->

“A key-value store, or key-value database, is a data storage paradigm designed for storing, retrieving, and managing associative arrays, a data structure more commonly known today as a dictionary or hash.” from Wikipedia. 

We would like you to implement a distributed Key-Value (KV) store using any language of your choice. For simplicity you can assume both the key and value types are strings. Your KV store should be running as (at least) 2 different processes that replicate data between them (ie) we should be able to put in a Key and Value to Process 1 and query for the same Key on Process 2, for which we should get the corresponding Value.

The following solution approaches are not considered correct

Using a common backend to your processes.
Using an existing open source KV stores like redis, etc.
We would like you to expose the store via a HTTP service that would allow us to GET / SET key-value pairs. Ideally, write it as you would a production piece of code with tests. Bonus points for making this as fast as possible. 

Sample Invocations

$ curl -H "Content-type: application/json" -XPOST http://localhost:4455/set/key -d ‘“value”’

OK 

$ curl -H “Accept: application/json” http://localhost:4466/get/key

“value”

<---------------------------------------------------------Solution---------------------------------------------------------->

To make it distributed system, communication between different node process are being done by socket.

Steps to run this program:

Open n terminal, let's say n = 4 for now.

Terminal 1> node DBServer.js

Terminal 2> node app.js 8081

Terminal 3> node app.js 8082

Terminal 4> node app.js 8083

Note: We can set key-value for a process running in one terminal and get the same key in other process running in other terminal

Terminal 2> curl localhost:8081/set/key1 -d "value=val1"

Terminal 3> curl localhost:8082/get/key1
val1

Terminal 3> curl localhost:8083/get/key1
val1

short video demo avaiable at: https://youtu.be/ZmrvqmJqWSQ
