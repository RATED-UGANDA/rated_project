const categoryModel = require('../models/category.model');
const adminModel = require('../models/admin.model');

async function listCategories(req, res, next) {
  try {
    const categories = await categoryModel.findAll();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const existing = await categoryModel.findByName(req.body.category_name);
    if (existing) {
      const err = new Error('Category already exists');
      err.status = 409;
      err.code = 'CATEGORY_EXISTS';
      throw err;
    }
    let adminId = null;
    const admin = await adminModel.findByUserId(req.user.user_id);
    if (admin) adminId = admin.admin_id;
    const categoryId = await categoryModel.create({
      category_name: req.body.category_name,
      description: req.body.description,
      admin_id: adminId,
    });
    const category = await categoryModel.findById(categoryId);
    res.status(201).json({ data: category });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory };
