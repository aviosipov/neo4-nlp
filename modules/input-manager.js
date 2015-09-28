var neoManager = require('./neo4j-manager') ;
var textProcessor = require('./text-processor') ;


var pos = require('pos');
var nlp = require("nlp_compromise");
var natural = require('natural') ,
    tokenizer = new natural.WordTokenizer() ,
    nounInflector = new natural.NounInflector() ;

var _ = require('underscore');
async = require("async");


/*
neoManager.getTopNodes(null,3, function (err,result) {
    console.log(result.data) ;
}) ;
*/

neoManager.findNode('beer', function (err,result) {
    console.log(result) ;
});

neoManager.findNode('happy', function (err,result) {
    console.log(result) ;
});




/// my test
/*
var ttt = 'The starch and saccharification enzymes are often derived from malted cereal grains' ;

var linksAndNodes = textProcessor.parseText(ttt) ;

console.log(ttt);
console.log(linksAndNodes);

textProcessor.generateNodes(linksAndNodes,function(err,data) {
      textProcessor.generateLinks(linksAndNodes) ;
}) ;
*/


var self = module.exports = {


    handleTextBlock : function ( text) {

        /// break into lines
        var sentences =  nlp.sentences(text) ;

        sentences.forEach(function(sentence,index) {

            /// process line by line
            self.handleSingleLine(sentence) ;

        }) ;


    } ,


    handleSingleLine: function(text) {

        if (text === 'clear')  {

            neoManager.emptyDB(function() {
                console.log('db is empty now') ;
            })  ;

        } else {

            var linksAndNodes = textProcessor.parseText(text) ;

            console.log(text);
            console.log(linksAndNodes);

            textProcessor.generateNodes(linksAndNodes,function(err,data) {
                textProcessor.generateLinks(linksAndNodes) ;
            }) ;

        }

        return true;
    },


};