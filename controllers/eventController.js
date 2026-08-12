const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Create new event (organizer only)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, seatLimit } = req.body;

    if (!title || !date || !venue || !seatLimit) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      seatLimit,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get organizer's dashboard (their events + stats)
// @route   GET /api/events/dashboard/my
const getMyEventsDashboard = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ date: 1 });

    const eventIds = events.map((e) => e._id);

    const registrations = await Registration.find({ event: { $in: eventIds } });

    const dashboard = events.map((event) => {
      const eventRegs = registrations.filter(
        (r) => r.event.toString() === event._id.toString()
      );
      const attendedCount = eventRegs.filter((r) => r.attended).length;

      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        seatLimit: event.seatLimit,
        registeredCount: event.registeredCount,
        attendedCount,
        status: event.status,
      };
    });

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, getMyEventsDashboard };