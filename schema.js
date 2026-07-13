const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().allow(''),
        price: joi.number().min(0).required(),
        location: joi.string().required(),
        country: joi.string().required(),
        image: joi.alternatives().try(joi.string().uri().allow(''), joi.object({
            url: joi.string().uri().required(),
            filename: joi.string().allow('')
        })).default("https://cf.bstatic.com/xdata/images/hotel/max1024x768/656411102.jpg?k=7e1185b2b5cee354505b239d9266d7b4e14922dcc32f66404c06554bacdbac1a&o="),
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().min(1).max(5).required(),
        comment: joi.string().max(500).required()
    }).required()
});