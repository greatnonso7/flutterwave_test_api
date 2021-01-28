const router = require('express').Router();
const { base, validate } = require('../controllers/base');

router
  .route('/')
  .get(base);

router
  .route('/validate-rule')
  .post(validate);


module.exports = router;