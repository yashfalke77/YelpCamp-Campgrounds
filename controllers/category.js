const Category = require('../models/category')
const Campground = require('../models/campgrounds');

module.exports.index = async (req, res) => {
    const categories = await Category.find({})
    const campgrounds = await Campground.find({})
    campgrounds.splice(2)
    return res.render('category/index', { categories ,campgrounds })
}

module.exports.showCamp = async(req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    const campgrounds = await Campground.find({category: {_id:id}})
    res.render('category/show.ejs', {campgrounds , category})
}