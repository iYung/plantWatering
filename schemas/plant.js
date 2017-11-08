var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlantSchema   = new Schema({
    name: String,
    goalMoisture: Number,
    moisture: Number,
    prevMoisture: [Number]
});

module.exports = mongoose.model('Plant', PlantSchema);