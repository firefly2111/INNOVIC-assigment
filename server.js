const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/innovic",{useNewUrlParser: true});

var Schema = mongoose.Schema;

var appsSchema = new Schema({
	"_id": String,
	"type": String,
	"name": String,
	"createdAt": Date,
	"deleted": Boolean,
	"enabled": Boolean,
	"price": Number,
	"meta": {"package": String, "platform": String}
});
var pointsSchema = new Schema({
	"_id": Schema.ObjectId,
	"applicationId": String,
	"points": Number,
	"status": String,
	"updatedAt": Date,
	"createdAt": Date,
	"completedAt": Date
});
var apps = mongoose.model("apps", appsSchema);
var points = mongoose.model("points", pointsSchema);
app.get("/", (req, res) => {
	res.sendFile(process.cwd() + "/index.html");
});

app.get("/api/application", (req,res) => {
	var storeData = [];
	points.aggregate([{$lookup: {from: "apps", localField: "applicationId", foreignField:"_id", as:"point"}},
	{$group: {_id: "$point", totalPoints: {$sum: "$points"}}},
	{$project: {"_id._id": 1, "_id.name": 1,"_id.meta.platform": 1, totalPoints: 1}},
	{$sort:{totalPoints: -1}}
	]).then(result => {res.status(200).json({
		status: true,
		total: result.length,
		items: result});
	}).catch(err => {res.status(401).json({"message": "error"})});
})
app.get("/api/application/:applicationID", (req, res) => {
	var appId = req.params.applicationID;
	apps.findById(appId).then(result => {
		res.status(200).json(result);
		}).catch(err => {
			res.status(404).json({"message": "Error"});
	});
});

app.listen(port, function(){
});
