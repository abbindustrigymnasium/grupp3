const express = require("express");

const router = express();

var mysql = require("mysql");

var con = mysql.createConnection({

    host: "iot.abbindustrigymnasium.se",

    user: "ljuside3",

    password: "kattmat",

    database: "ljuside3"

});



con.connect(function (err){

    if (err);

});







/*router.post("", (req, res) => {

    console.log(req.body);

    res.status(200).json({"name":"Lampgod","hard":54,"strength":26} );

});*/



var Values_fromDB;

var CronJob = require("cron").CronJob;

new CronJob("* * * * * *", function(){

    

    var GetLight = function() {

        return new Promise(function (resolve, reject){

            con.query("SELECT * FROM grupp3lampadata", function (err, result){

                if (err){

                    return reject(err);

                } else {

                    return resolve(result)

                }

            });

        });

    }

    GetLight().then(response =>{

        Values_fromDB = response;

    })





}, null, true, "America/Los_Angeles");



router.get("/:lampName", (req, res) => { // get

    var found = false;

    var outputValue;

    Values_fromDB.forEach(element => {

        if (element.name == req.params.lampName){ // om lampnamnet finns, ger vi dess data till outputvalue

            found = true;

            outputValue = element;

        }

    });

    if (found != true){ // annars returnerar vi meddelandet nedan

        res.status(200).json({name: "none", message: "no such lamp exists"});

    } else {

        res.status(200).json(outputValue);

        console.log(outputValue);

    }

});



router.patch("", (req, res, next) => {

    const product = { // skapar ett objekt med all data som vi får med

      name: req.body.name,

      temperature: req.body.temperature,

      strength: req.body.strength,

      onoroff: req.body.onoroff,

      brightness: req.body.brightness,

      previousTime: req.body.previousTime,

  };

//'UPDATE `grupp3lampadata` SET `temperature`= ?, `strength`= ?, `onoroff`= ? WHERE `name` = ?'

  let querystring= 'UPDATE `grupp3lampadata` SET'; // skapar en querystring

  if (product.temperature != null){ // om temperature finns, lägger vi till i querystringen

      querystring += " temperature = " + product.temperature + ",";

  } if (product.strength != null){

        querystring += " strength = " + product.strength + ",";

  } if (product.onoroff != null){

        querystring += " onoroff= " + product.onoroff + ",";

  } if (product.brightness != null){

        querystring += " brightness= " + product.brightness + ",";

  } if (product.previousTime != null){

        querystring += " previousTime= " + product.previousTime + ",";

  }

   var name = product.name;

   querystring = querystring.slice(0, -1); // tar bort det sista character för att få bor kommatecknet

   querystring += " WHERE name = ?"; // lägger till ytterligare lite sql kod i querystringen





  var updateProduct = function(){

      return new Promise(function(resolve, reject){

           con.query(querystring, [name], function (error, results) { // kör sql kod med querystring

             if (error){

              return reject(error);

             } else{

              return resolve(results);

             }

             

           });

         });

           

    };

  

    updateProduct().then( result => {

      if(result.affectedRows>0)

      res.status(200).json(result);

      else

      res.status(404).json({message: 'Update impossible, lack of value'});

  }).catch(err => {

      res.status(500).json({

          error: err

      });

  

  });

  });



router.post("", (req, res, next) => { // hanterar post

    const product = { // skapar objekt

        name: req.body.name,

        hard: req.body.hard,

        strength: req.body.strength

    };

    var createdProduct = function(){ // skapar variabel som antingen innehåller error eller theproduct

      return new Promise(function(resolve, reject){



           var theproduct = [product.name, product.hard, product.strength];

           console.log(theproduct);

           con.query('INSERT INTO grupp3lampadata (name, hard, strength) VALUES ?',[[theproduct]], function (error, results, fields) {

             if (error) 

             return reject(error);

             else

             return resolve(theproduct);

           });

         });

           

    };



    createdProduct().then( theproduct => {

     res.status(201).json({

          message: "success, new product",

          product: theproduct

     });

  }).catch(error => {

    res.status(500).json({

      error: error

    });

  });



});

module.exports = router;