var express = require('express');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var router = express.Router();

router.get('/show/:id', function(req, res, next){
	var posts = db.get('posts');

	posts.findById(req.params.id, function(err, post){
		res.render('show',{
			"post": post
		});
	});

});

router.get('/add', function(req, res, next){
	var categories = db.get('categories');

	categories.find({},{},function(err, categories){
		res.render('addpost',{
			"title": "Add Post",
			"categories": categories
		});
	});
});

router.post('/add', function(req, res, next){
	// Get Form Value
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author 		= req.body.author;
	var date 		= new Date();

	if (req.file.mainimage) {
		var mainImageOriginialName 	= req.file.mainimage.originalname;
		var mainImageName 			= req.file.mainimage.name;
		var mainImageMime 			= req.file.mainimage.mimetype;
		var mainImagePath 			= req.file.mainimage.path;
		var mainImageExt 			= req.file.mainimage.extension;
		var mainImageSize 			= req.file.mainimage.size;

	}else{
		var mainImageName = 'noimage.png';
	}

	// Form Validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'body filed is required').notEmpty();

	// check Errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('addpost',{
			"errors": errors,
			"title": title,
			"body": body
		});
	}else{
		var posts = db.get('posts');

		//
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainImageName
		}, function(err, post){
			if (err) {
				res.send('There was an issue submitting the post');
			}else{
				req.flash('success', 'Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});


router.post('/addcomment', function(req, res, next){
	// Get Form Value
	var name 		= req.body.name;
	var email 		= req.body.email;
	var body 		= req.body.body;
	var postid 		= req.body.postid;
	var commentdate = new Date();

	// Form Validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('eamil', 'Email field is required').notEmpty();
	req.checkBody('eamil', 'Email is not formatted correctly').isEmail();
	req.checkBody('body', 'body filed is required').notEmpty();

	// check Errors
	var errors = req.validationErrors();

	if (errors) {
		var posts = db.get('posts');
		posts.findOne({_id: postid}, function(err, doc){
			res.render('show',{
				"errors": errors,
				"post": doc,
			});
		});

	}else{
		var comment = {"name":name, "email":email, "body":body, "commentdate":commentdate};
		var posts = db.get('posts');

		//
		posts.update({
			"_id":postid
			},
			{
				$push:{
					"comments":comment
				}
			},
			function(err, doc){
				if (err) {
					throw err;
				}else{
					req.flash('success', 'Comment Added');
					res.loaction('/posts/show/'+ postid);
					res.redirect('/posts/show/'+ postid);
				}
			}
		);
	}
});

module.exports = router;