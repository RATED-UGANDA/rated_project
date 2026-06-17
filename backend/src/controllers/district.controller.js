const districtModel = require('../models/district.model');
const adminModel = require('../models/admin.model');

async function listDistricts(req, res, next) {
  try {
    const districts = await districtModel.findAll();
    res.json({ data: districts });
  } catch (err) {
    next(err);
  }
}

async function createDistrict(req, res, next) {
  try {
    let adminId = null;
    const admin = await adminModel.findByUserId(req.user.user_id);
    if (admin) adminId = admin.admin_id;
    const districtId = await districtModel.create({
      district_name: req.body.district_name,
      region: req.body.region,
      admin_id: adminId,
    });
    const district = await districtModel.findById(districtId);
    res.status(201).json({ data: district });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDistricts, createDistrict };
