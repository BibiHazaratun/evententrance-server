const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, organizerOnly, createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);

module.exports = router;