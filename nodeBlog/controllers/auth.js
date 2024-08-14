const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const User = require('../models/user');



exports.signup = async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    try {
        const hashedPw = await bcrypt.hash(password, 12);
        let newUser = new User({
            email: email,
            password: hashedPw,
            name: name
        });

        newUser = await newUser.save();
        res.status(201).json({ message: 'User created!', userId: newUser._id });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            next( error);
        }

        const result = bcrypt.compare(password, user.password);
        if (!result) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
 
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id.toString()
            },
            'mahmoud saleh novell',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token: token, userId: user._id.toString()
        });

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}