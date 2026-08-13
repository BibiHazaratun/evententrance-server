const Registration = require('../models/Registration');
const Event = require('../models/Event');
const sendRegistrationEmail = require('../config/sendEmail');
const QRCode = require('qrcode');

// @desc    Register for an event (attendee)
// @route   POST /api/registrations/:eventId
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredCount >= event.seatLimit) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const alreadyRegistered = await Registration.findOne({
      event: event._id,
      attendee: req.user._id,
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const registration = await Registration.create({
      event: event._id,
      attendee: req.user._id,
    });

    event.registeredCount += 1;
    await event.save();

    const qrImage = await QRCode.toDataURL(registration.qrCode);
    await sendRegistrationEmail({
      to: req.user.email,
      name: req.user.name,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      qrImage,
    });

    res.status(201).json({
      _id: registration._id,
      event: event.title,
      qrCode: registration.qrCode,
      qrImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance by scanning QR code (organizer only)
// @route   POST /api/registrations/scan/:qrCode
const markAttendance = async (req, res) => {
  try {
    const registration = await Registration.findOne({ qrCode: req.params.qrCode })
      .populate('event')
      .populate('attendee', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    if (registration.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this event' });
    }

    if (registration.attended) {
      return res.status(400).json({ message: 'Already checked in', attendedAt: registration.attendedAt });
    }

    registration.attended = true;
    registration.attendedAt = new Date();
    await registration.save();

    res.json({
      message: 'Attendance marked successfully',
      attendee: registration.attendee.name,
      event: registration.event.title,
      attendedAt: registration.attendedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's registrations
// @route   GET /api/registrations/my
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ attendee: req.user._id })
      .populate('event', 'title date venue');

    const registrationsWithQr = await Promise.all(
      registrations.map(async (reg) => {
        const qrImage = await QRCode.toDataURL(reg.qrCode);
        return {
          ...reg.toObject(),
          qrImage,
        };
      })
    );

    res.json(registrationsWithQr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerForEvent, markAttendance, getMyRegistrations };