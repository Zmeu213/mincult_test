var conString = "postgres://postgres:postgres@localhost/mincult";
var pgp = require('pg-promise')();
var db = pgp(conString)

var Validator = require('jsonschema').Validator;
var v = new Validator();
var instance = 'kek';
var schema = require('./schema')

var _ = require("underscore")

function checkJSON (id) {
	return db.oneOrNone("select json from sample_table where id =" + id)
}

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
		console.log(removeNames(data[i].json));
	}
}, function(error){
	console.log(error)
})
