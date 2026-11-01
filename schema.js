const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().allow(''),
        price: joi.number().min(0).required(),
        location: joi.string().required(),
        country: joi.string().required(),
        category: joi.string().allow('', null),
        imageUrl: joi.string().uri().allow('', null),
        image: joi.alternatives().try(
            joi.string().uri().allow(''),
            joi.object({
                url: joi.string().uri().required(),
                filename: joi.string().allow('')
            })
        ).optional()
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().min(1).max(5).required(),
        comment: joi.string().max(500).required()
    }).required()
});
