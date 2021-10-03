
const BaseJoi = require('joi')
const sanitizeHTML = require('sanitize-html')

// ------------------------------------ Avoiding Cross side scripting ------------------------------
// JOi doesnt have to check if Html is present in input
// npm i sanitize-html to check but adding in JOI extension
// wherever there is string apply escapeHtML there only

const extension = (joi) => ({
    type: 'string',
    base: joi.string(), 
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML:{
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', {value})
                }
                return clean
            }
        }
    }
})

const Joi = BaseJoi.extend(extension)


module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        category: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),

    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required()
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required().escapeHTML(),
        password: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML()
    }).required()
})

