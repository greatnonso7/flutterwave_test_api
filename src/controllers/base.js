const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');
const { empty } = require('../utils')


/**
 * @desc Get Person details
 * @route GET /api/v1/
 * @access PUBLIC 
 */
exports.base = asyncHandler(async (req, res, next) => {
  return res.status(200).json({
    message: 'My Rule-Validation API',
    status: 'success',
    data: {
      name: 'Ichoku Great Chinonso',
      github: '@greatnonso7',
      email: 'greatchinonso7@gmail.com',
      mobile: '09038605095',
      twitter: '@ChinonsoIchoku'
    }
  })
});

/**
 * @desc Validate Rule
 * @route POST /validate-rule
 * @access PUBLIC
 */

const keysAll = (obj, path) => {
  if (!path) return obj;
  const properties = path.split('.');
  return keysAll(obj[properties.shift()], properties.join('.'));
};

exports.validate = asyncHandler(async (req, res, next) => {
  const payload = req.body;

  if (typeof payload !== 'object' || !Object.keys(payload).length || (typeof payload === 'object' && Array.isArray(payload))) {
    return next(new ErrorResponse('Invalid JSON payload passed.', 400));
  }

  if (!Object.hasOwnProperty.call(payload, 'rule')) {
    return next(new ErrorResponse('rule is required.', 400))
  }

  if (!Object.hasOwnProperty.call(payload, 'data')) {
    return next(new ErrorResponse('data is required.', 400))
  }

  if (typeof payload.rule !== 'object' || (typeof payload.rule === 'object' && Array.isArray(payload.rule))) {
    return next(new ErrorResponse('rule should be an object.', 400));
  }

  if (typeof payload.data !== 'object' && typeof payload.data !== 'string') {
    return next(new ErrorResponse('data should be a valid json object, string or an array.', 400));
  }

  const expectedRuleField = ['field', 'condition', 'condition_value'];

  for (let i = 0; i < expectedRuleField.length; i++) {
    const element = expectedRuleField[i];
    if (!Object.hasOwnProperty.call(payload.rule, element) || empty(payload.rule[element])) {
      return next(new ErrorResponse(`${element} is required.`, 400));
    }
  }

  const requestValue = keysAll(payload.data, payload.rule.field);

  if (!requestValue) {
    return next(new ErrorResponse(`field ${payload.rule.field} is missing from data.`, 400));
  }

  let conditionResult = false;

  switch (payload.rule.condition) {
    case 'eq':
      conditionResult = requestValue === payload.rule.condition_value;
      break;

    case 'neq':
      conditionResult = requestValue !== payload.rule.condition_value;
      break;

    case 'gt':
      conditionResult = requestValue > payload.rule.condition_value;
      break;

    case 'gte':
      conditionResult = requestValue >= payload.rule.condition_value;
      break;

    case 'contains':
      conditionResult = requestValue.includes(payload.rule.condition_value);
      break;

    default:
      conditionResult = false;
      break;
  }

  if (!conditionResult) {
    return res.status(400).json({
      message: `field ${payload.rule.field} failed validation.`,
      status: "error",
      data: {
        validation: {
          error: true,
          field: payload.rule.field,
          field_value: requestValue,
          condition: payload.rule.condition,
          condition_value: payload.rule.condition_value
        }
      }
    })
  }

  return res.status(200).json(
    {
      message: `field ${payload.rule.field} successfully validated.`,
      status: "success",
      data: {
        validation: {
          error: false,
          field: payload.rule.field,
          field_value: requestValue,
          condition: payload.rule.condition,
          condition_value: payload.rule.condition_value,
        }
      }
    }
  )
})