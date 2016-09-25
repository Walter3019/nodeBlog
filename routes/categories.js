var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var router = express.Router();

router.get('/show/:category',function(req, res, next){
	var db = req.db;
	var posts = db.get('posts');

	posts.find({category: req.params.category},{},function(err, posts){
		res.render('index',{
			title: req.params.category,
			posts : posts
		})
	});
});

/* Homepage Blog Posts */
router.get('/add', function(req, res, next) {
	res.render('addcategory', {
		"title": "Add Category"
	});
});

router.post('/add', function(req, res, next){
	// Get Form Value
	var title 		= req.body.title;

	// Form Validation
	req.checkBody('title', 'Title field is required').notEmpty();

	// check Errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('addcategory',{
			"errors": errors,
			"title": title,
		});
	}else{
		var categories = db.get('categories');

		//
		categories.insert({
			"title": title
		}, function(err, categories){
			if (err) {
				res.send('There was an issue submitting the categories');
			}else{
				req.flash('success', 'categories Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;
