var conString = "postgres://postgres:postgres@localhost/mincult";
var pgp = require('pg-promise')();
var db = pgp(conString)

var Validator = require('jsonschema').Validator;
var v = new Validator();
var schema = require('./schema')

var data = require('./data')

var _ = require("underscore")

// for (var i in data) {
// 	console.log(data[i]);
// 	db.none("insert into sample_table(json) values ('" + JSON.stringify(data[i]) + "')")
// }

function removeNames (obj) {
	var keys = _.keys(obj)
	if (keys) {
		for (var i in keys) {
			if (/name/gi.test(keys[i])){  // or ^name$ if no word parts
				obj = _.omit(obj,keys[i])
			}
			var next_keys = _.keys(obj[keys[i]])
			if (next_keys.length > 0){
				obj[keys[i]] = removeNames(obj[keys[i]])
			}
		}
	}
	return obj
}

db.any("select json from sample_table")
.then(function(data){
	for (var i in data) {
		var likeSchema = v.validate(data[i].json, schema).errors == 0
		console.log(likeSchema)
		if (likeSchema) {
			var noName = removeNames(data[i].json);
			console.log('Good:', noName);
			db.none("insert into another_table(json) values ('" + JSON.stringify(noName) + "')")
		} else {
			console.log('Bad:',removeNames(data[i].json));
		}
	}
}, function(error){
	console.log(error)
})
