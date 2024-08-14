const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    try {
        totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({createdAt : -1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts,
            totalItems: totalItems
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\", "/");

    let newPost = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    try {
        newPost = await newPost.save();
        let user = await User.findById(req.userId);
        user.posts.push(newPost);
        user = await user.save();
        io.getIo().emit('posts', {
            action: 'create',
            post: {...newPost._doc, creator : {_id : req.userId, name: user.name}}
        });
        res.status(201).json({
            message: "post created successfuly",
            post: newPost,
            creator: { _id: user._id, name: user.name }
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId)
            .populate('creator');

        if (!post) {
            const error = new Error('could not find post.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'Post fetched',
            post: post
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    try {
        let post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;

        post = await post.save();

        io.getIo().emit('posts', {
            action: 'update',
            post: post 
        });

        res.status(200).json({ message: 'Post updated!', post: post });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };

};

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        let post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);
        post = await Post.findByIdAndDelete(postId);
        let user = await User.findById(req.userId);
        user.posts.pull(postId);
        user = await user.save();

        io.getIo().emit('posts', {
            action: 'delete',
            post: postId
        });
        
        res.status(200).json({ message: 'Deleted post.' });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({
            message: 'successed',
            status: user.status
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.putStatus = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('status can not be empty.');
        error.statusCode = 422;
        throw error;
    }

    const status = req.body.status;

    try {
        const user = await User.findById(req.userId);
        user.status = status;
        await user.save();
        res.status(200).json({
            message: 'successed!',
            status: user.status
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};