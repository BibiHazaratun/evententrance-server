const express = require('express');
const router = express.Router();
const { registerForEvent, markAttendance, getMyRegistrations } = require('../controllers/registrationController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyRegistrations);
router.post('/:eventId', protect, registerForEvent);
router.post('/scan/:qrCode', protect, organizerOnly, markAttendance);

module.exports = router;