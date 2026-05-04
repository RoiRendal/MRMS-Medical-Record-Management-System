const mongoose = require('mongoose');
const { createHttpError } = require('./httpError');

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function requireFields(source, fields) {
  const missing = fields.filter((field) => {
    const value = normalizeValue(source?.[field]);
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw createHttpError(`${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required`, 400);
  }
}

function requireMongoObjectId(value, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(`${fieldName} must be a valid id`, 400);
  }
}

function validateAvailability(availability) {
  if (availability === undefined) return;
  if (!Array.isArray(availability)) {
    throw createHttpError('availability must be an array', 400);
  }

  availability.forEach((slot, index) => {
    requireFields(slot, ['day', 'startTime', 'endTime']);
    const day = String(slot.day).trim().toLowerCase();
    const allowed = new Set([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]);
    if (!allowed.has(day)) {
      throw createHttpError(`availability[${index}].day is invalid`, 400);
    }
  });
}

module.exports = {
  requireFields,
  requireMongoObjectId,
  validateAvailability,
};
