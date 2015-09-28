var neoManager = require('./neo4j-manager') ;


var pos = require('pos');
var nlp = require("nlp_compromise");

var natural = require('natural') ,
    tokenizer = new natural.WordTokenizer() ,
    nounInflector = new natural.NounInflector() ;

var _ = require('underscore');
async = require("async");



var self = module.exports = {


    generateLabels : function (text) {


        var verb =	['VB' , 'VBD' , 'VBN' , 'VBP' , 'VBZ' , 'VBF' ,  'VBG'] ;
        var adjective = [ 'JJ' , 'JJR' , 'JJS'  ] ;
        var adverb = ['RB' , 'RBR' , 'RBS' ]  ;
        var noun = ['NN' , 'NNP' , 'NNPA' , 'NNAB' , 'NNPS' , 'NNS' , 'NNO' , 'NG' , 'PRP' , 'PP'] ;
        var value = ['CD' , 'DA' , 'NU'] ;


        var labels 	= [] ;
        var s 		= nlp.pos(text).sentences[0] ;
        var tags 	= s.tags() ;

        tags.forEach(function(tag,index) {

            var t = '' ;

            if (_.contains(verb,tag)) t = 'verb' ;
            if (_.contains(adjective,tag)) t = 'adjective' ;
            if (_.contains(adverb,tag)) t = 'adverb' ;
            if (_.contains(noun,tag)) t = 'noun' ;
            if (_.contains(value,tag)) t = 'value' ;

            labels.push(t) ;

        }) ;


        return labels ;







    } ,


    generateNodes: function (nodeList,mainCallback) {

        async.each(nodeList.nodes, function(node,callback) {

                var item = { title : node } ;
                var labels = self.generateLabels(node) ;

                neoManager.findOrSaveNode(item,labels, function(err,data) {
                    callback() ;
                });

            },
            function (err) {

                console.log('all nodes generated') ;
                mainCallback() ;

            }) ;

    } ,





    generateLinks: function (nodeList) {


        /// go trough links and create nodes and links

        nodeList.links.forEach(function(item,index) {



            var fromIndex = 0 , toIndex = 0 ;


            async.parallel([

                    function (callback) {

                        var node = { title : item.from } ;
                        var labels = self.generateLabels(item.from);

                        neoManager.findOrSaveNode(node,labels, function(err,data) {

                            fromIndex = data ;
                            callback(null,data) ;
                        }) ;

                    } ,

                    function (callback) {

                        var node = { title : item.to } ;
                        var labels = self.generateLabels(item.to);

                        neoManager.findOrSaveNode(node,labels, function(err,data) {
                            toIndex = data ;
                            callback(null,data) ;
                        }) ;

                    }],

                function (err,result) {

                    neoManager.findOrSaveRelationship(fromIndex,toIndex,item.relation, null , function(err,data) {
                    }) ;

                }) ;



        }) ;

    },

    parseText : function ( text ) {


        var nodeList = [] ;
        var linkList = [] ;

        var nodeElementList = [ 'VB' , 'VBD' , 'VBN' , 'VBP' , 'VBZ' , 'VBF' ,  'VBG' ,
            'JJ' , 'JJR' , 'JJS' ,
            'RB' , 'RBR' , 'RBS' ,
            'NN' , 'NNP' , 'NNPA' , 'NNAB' , 'NNPS' , 'NNS' , 'NNO' , 'NG' , 'PRP' , 'PP' ,
            'CD' , 'DA' , 'NU'  ] ;


        text = text.toLowerCase() ;
        var words = tokenizer.tokenize(text) ;




        var link = {} ;

        words.forEach(function(item,pos) {

                var tag = nlp.pos(item).tags()[0] ;

                console.log(item + ' > ' + tag[0]) ;


                if (_.contains(nodeElementList,tag[0])) {

                nodeList.push(item) ;

                if (link.hasOwnProperty('from')) {

                    if (!link.hasOwnProperty('relation'))
                        link.relation = 'a' ;

                    link.to = item ;
                    linkList.push(link) ;

                    link = {} ; // reset
                    link.from = item ;

                } else {

                    link.from = item ;

                }

            } else {

                if (link.hasOwnProperty('from')) {
                    link.relation = item ;
                }


            }


        }) ;

        var response = {} ;

        response.links = linkList ;
        response.nodes = nodeList ;


        return response;


    } ,



};