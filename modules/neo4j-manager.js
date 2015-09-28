//var neo4j = require('neo4j');
//var db = new neo4j.GraphDatabase('http://neo4j:neo4j@0.0.0.0:7474');

var format = require("string-template")
var neo4j = require('node-neo4j');
var db = new neo4j('http://neo4j:neo4j@0.0.0.0:7474');



	
var self = module.exports = {

	findOrSaveRelationship : function ( from , to , relType , data , callback ) {

		var query = format("start n1 = node({from}), n2 = node({to}) match n1-[r:{rel}]->n2 return r;" , 
					{from : from , to : to , rel : relType }) ; 

		db.cypherQuery(query, function(err, result) {

			if (result.data.length > 0) {

				return callback (null,result.data[0]._id) ; 

			} else  {

				console.log('relation was set'); 
				self.setRelationship(from,to,relType,data, function (err,data) {
					return callback(err,data) ; 
				}) ; 

			}

		});		

	} , 


	setRelationship : function ( from , to , relType , data , callback ) {

		db.insertRelationship(from, to, relType, data , function(err, relationship) {
			callback(err,relationship) ; 
		});		

	} , 

	findOrSaveNode : function (data, labels , callback ) {

		var query = format("match(n{title:'{title}'}) return n", {title : data.title}) ;


		db.cypherQuery(query, function(err, result) {


			if (result.data.length > 0) {

				return callback (null,result.data[0]._id)

			} else  {
								
				self.saveNode(data,labels, function(err,data) {
					return callback(err,data); 
				}) ; 
			
			}

		});		


	} , 


	saveNode: function(data,labels,callback) {

    		
		db.insertNode( data  , labels , function(err, node) {

            if (err) {

                console.log(data) ;
                console.log(labels) ;
                console.log(err);


            }

		    if (err) callback (err,null) ; 
		    else callback (null, node._id) ; 

	    })  ;


	} , 


	emptyDB : function(callback) {

		var query = 'MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r' ; 

		db.cypherQuery(query, function(err, result){

		    if(err) throw err;

		    callback() ; 
		});		


	} ,

	getTopNodes : function(startNode, limit, callback) {

		var query = format('MATCH (n)-[r]->(x) RETURN n, COUNT(r) ORDER BY COUNT(r) DESC LIMIT {limit}' , { limit : limit } )  ;


		/// if we have a start node
		/*
		START n=node(5682) MATCH (n)-[r]-(x) RETURN x , count(x) ORDER BY COUNT(x) DESC LIMIT 20


		// get connected nodes from node
		 start a=node(3898) match (a)-[*]->(node) return node limit 100;
		*/

		db.cypherQuery(query, function(err, result){

			callback(err,result) ;

		});

	} ,


	findNode : function (title ,callback) {

		var query = format("match (n) where n.title = '{title}' return n" , {title : title } )

		db.cypherQuery(query, function(err, result){
			callback(err,result) ;
		});

	} ,

	findRelationships : function ( from , to , depth , limit , callback ) {

		//// start n1 = node(2471), n2 = node(5672) match p-[f1]-n1-[r*1..3]->n2-[z]->v return p,f1,n1,r,n2,z,v limit 45 ;

		var query = format('start n1 = node({n1}), n2 = node({n2}) match n1-[r*1..{depth}]->n2 return n1,r,n2 limit {limit}' ,
							{n1:from , n2 : to , depth : depth , limit : limit } ) ;

		db.cypherQuery(query, function(err, result){
			callback(err,result) ;
		});

	}


  
};