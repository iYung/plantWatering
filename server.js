var mongoose = require('mongoose');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var Particle = require('particle-api-js');
var particle = new Particle();
var token;
particle.login({username: '', password: ''}).then(
  function(data) {
    token = data.body.access_token;
  },
  function (err) {
    console.log('Could not log in.', err);
  }
);

var Plant = require('./schemas/plant');

//db connect
var db = ""
mongoose.connect(db,{useMongoClient: true});

//port setup
var port = 8080;

//allow CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  console.log('Req made');
  next();
});

var router = express.Router();

app.use(express.static('client/build'));

router.route('/')
    .post(function(req, res) {
        console.log(req.body.name);
        console.log(req.body.moisture);
        return res.send("100");
    });

//login
router.route('/login')
    .post(function(req, res) {
        Plant.findOne({
            name: req.body.name
        },function(err, plant) {
            if (err)
                return res.send(err);
            if (plant == null) {
                return res.json({ success: false });
            } else {
                return res.json({ success: true, goalMoisture: plant.goalMoisture, moisture: plant.moisture, prevMoisture: plant.prevMoisture });
            }
        });
    });
    
//update plant
router.route('/update')
    .post(function(req, res) {
        Plant.findOne({
            name: req.body.name
        },function(err, plant) {
            if (err)
                return res.send(err);
            if (plant == null) {
                console.log(req.body.name);
                console.log(req.body.moisture);
                console.log("new");
                var newPlant = new Plant();
                newPlant.name = req.body.name;
                newPlant.goalMoisture = 1000;
                newPlant.moisture = req.body.moisture;
                newPlant.prevMoisture = new Array(24).fill(0);
                newPlant.prevMoisture.push(newPlant.moisture);
                newPlant.save(function(err) {
                    if (err)
                        return res.send(err);
                    return res.json({ goalMoisture: newPlant.goalMoisture });
                });
            } else {
                console.log(req.body.name);
                console.log(req.body.moisture);
                plant.moisture = req.body.moisture;
                plant.prevMoisture.splice(0,1);
                plant.prevMoisture.push(plant.moisture);
                plant.save(function(err) {
                    if (err)
                        return res.send(err);
                    var publishEventPr = particle.publishEvent({ name: 'demo', data: String(plant.goalMoisture), auth: token });
                    publishEventPr.then(
                      function(data) {
                        if (data.body.ok) { console.log("Event published succesfully") }
                      },
                      function(err) {
                        console.log("Failed to publish event: " + err)
                      }
                    );
                    return res.json({ goalMoisture: plant.goalMoisture });
                });
            }
        });
    });
    
//update goal for plant
router.route('/updategoal')
    .post(function(req, res) {
        Plant.findOne({
            name: req.body.name
        },function(err, plant) {
            if (err)
                return res.send(err);
            if (plant == null) {
                return res.send(err);
            } else {
                console.log(req.body.name);
                console.log(req.body.goalMoisture);
                plant.goalMoisture = req.body.goalMoisture;
                plant.save(function(err) {
                    if (err)
                        return res.send(err);
                });
                return res.json({ success: true });
            }
        });
    });

//use router
app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);