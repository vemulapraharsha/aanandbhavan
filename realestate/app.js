//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
var validator = require("email-validator");
var multer = require('multer');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.text());
app.use(express.json());
app.use(express.static("public"));




// Global variables
var login_data;
var agent_data = "";
var property_data;



// DB code

const mysql = require('mysql');
const { filter } = require("lodash");

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Aa@praharsha4621NL76',
  database: 'project'
};

function executeQueryAndCloseConnection(query, res , route) {
  const con = mysql.createConnection(dbConfig);
  con.connect(function (err) {
    if (err) {
      // Handle connection error
      console.error("Error connecting to the database:", err);
      res.status(500).json({ error: "An error occurred while connecting to the database." });
      return;
    }
    con.query(query, function (err, results) {
      con.end(function (err) {
        if (err) {
          console.error("Error closing the database connection:", err);
        }
        if (err) {
          // Handle query error
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "An error occurred while executing the database query." });
          return;
        }
        //checking where to store results
        if(route === "property"){
          property_data = results;
        }
      });
    });
  });
}

// end of db code


app.get("/" , (req , res)=>{
  res.render("home");
  const query = "SELECT * FROM property";
  executeQueryAndCloseConnection(query, res , "property");

});


app.post("/", function(req, res) {
  login_data = JSON.parse(req.body);
  if (login_data['logging'] === "agent") {
    let email = login_data['email'];
    // Create a new connection
    const con = mysql.createConnection(dbConfig);
    con.connect(function(err) {
      if (err) {
        // Handle connection error
        console.error("Error connecting to the database:", err);
        res.status(500).json({ error: "An error occurred while connecting to the database." });
        return;
      }
      con.query("SELECT * FROM agent WHERE email = ?", [email], function (err, results) {
        // Close the connection after the query has completed
        con.end(function(err) {
          if (err) {
            // Handle connection closing error
            console.error("Error closing the database connection:", err);
          }
          if (err) {
            // Handle query error
            console.error("Error executing the query:", err);
            res.status(500).json({ error: "An error occurred while executing the database query." });
            return;
          }
          agent_data = results;
          if (agent_data.length === 0 || login_data['password'] != agent_data[0].password) {
            login_data['result'] = 'nodata';
          } else {
            login_data['result'] = 'datafound';
          }
          res.status(200).json(login_data);
        });
      });
    });
  } else {
    // If 'logging' is not "agent", simply respond with the login_data
    res.status(200).json(login_data);
  }
});



// agent code
app.get("/agent", (req, res) => {
  // Create a new connection
  const con = mysql.createConnection(dbConfig);
  con.connect(function (err) {
    if (err) {
      // Handle connection error
      console.error("Error connecting to the database:", err);
      res.status(500).json({ error: "An error occurred while connecting to the database." });
      return;
    }
    con.query("SELECT * FROM agent WHERE agent_id = ?", [agent_data[0].agent_id], function (err, results) {
      con.end(function (err) {
        if (err) {
          console.error("Error closing the database connection:", err);
        }
        if (err) {
          // Handle query error
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "An error occurred while executing the database query." });
          return;
        }
        // Update the agent_data variable with the latest data
        agent_data = results;
        // Render the agent.ejs template with the updated agent_data
        res.render("agent", { agent_data: agent_data });
      });
    });
  });
});



app.post('/agent' , (req , res)=>{
  var received_data = req.body;
  var flag = validator.validate(received_data['email']);
  let result = {};
  if(received_data['phone_number'] != '' && received_data['phone_number'].length != 10){
    console.log(received_data['phone_number'].length);
    result['wrong'] = 'phone';
    res.status(200).json(result);
  }else if(received_data['email'] != '' && flag != true){
      res.status(200).json(result);
  }else{
    const entries = Object.entries(received_data);
    received_data['agent_id'] = agent_data[0].agent_id;
    // db con
    const con = mysql.createConnection(dbConfig);
    var query = "update agent set ";
    result = 1;
    entries.forEach(([key, value]) => {
      if(value != ''){
        if(result === 1){
          query = query + "" +key+" = '" +value +"' ";
          result = 0;
        }else{
          query = query +", "+ key + " = '" +value+"' ";
        }
      }
    });
    
    flag = " where agent_id = " + received_data['agent_id'] + ';';
    var execute = query + flag;

    // execute code
    con.connect(function(err) {
      if (err) {
        // Handle connection error
        console.error("Error connecting to the database:", err);
        res.status(500).json({ error: "An error occurred while connecting to the database." });
        return;
      }
    
      con.query(execute, function (err, result) {
        if (err) {
          // Handle query error
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "An error occurred while executing the query." });
          return;
        }
        res.json({ result: 'success' });

        // code to close the database connection
        con.end(function(err) {
          if (err) {
            console.error("Error closing the database connection:", err);
          }
          console.log("Database connection closed.");
        });


      });
    });

  }
});








// // Property route

// app.get('/property' , (req,res)=>{
//   const con = mysql.createConnection(dbConfig);
//   con.connect(function (err) {
//     if (err) {
//       // Handle connection error
//       console.error("Error connecting to the database:", err);
//       res.status(500).json({ error: "An error occurred while connecting to the database." });
//       return;
//     }
//     con.query("select *from property", function (err, results) {
//       con.end(function (err) {
//         if (err) {
//           console.error("Error closing the database connection:", err);
//         }
//         if (err) {
//           // Handle query error
//           console.error("Error executing the query:", err);
//           res.status(500).json({ error: "An error occurred while executing the database query." });
//           return;
//         }
//         // Update the agent_data variable with the latest data
//         property_data = results;
//         console.log(property_data);
//         // Render the agent.ejs template with the updated agent_data
//         res.render('property' , {property_data : property_data});
//       });
//     });
//   });
  
// });







// Now you can use the function in your Express route as follows:
app.get('/property', (req, res) => {
  res.render("property" , {property_data:property_data});
  console.log(property_data);
});

app.use(bodyParser.urlencoded({extended: true}));
app.post("/property" , (req,res)=>{
  let filter_data = req.body;
  let array = [];
  console.log(filter_data);
  for(var key in filter_data){
    if(filter_data[key] != ''){
      array.push(filter_data[key]);
    }
  }
  console.log(array);
  let query = `select *from property where `;
});







app.listen(4000, function() {
  console.log("Server started on port 4000");
});
