// backend/routes/campusClubRoutes.js

const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  addEvent,
  updateEvent,
  deleteEvent,
  addNews,
  deleteNews,
  joinClub,
  leaveClub,
  registerForEvent,
  getClubNews,
  getClubEvents
} = require('../controllers/campusClubController');

// Public routes (for all authenticated users)
router.use(auth);

// Get all clubs
router.get('/', getAllClubs);

// Get club by ID
router.get('/:id', getClubById);

// Get club news
router.get('/:id/news', getClubNews);

// Get club events
router.get('/:id/events', getClubEvents);

// Join/leave club
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);

// Register for event
router.post('/:clubId/events/:eventId/register', registerForEvent);

// Admin only routes
router.use(adminAuth);

// Create/Update/Delete club
router.post('/', createClub);
router.put('/:id', updateClub);
router.delete('/:id', deleteClub);

// Add/Update/Delete event
router.post('/:id/events', addEvent);
router.put('/:clubId/events/:eventId', updateEvent);
router.delete('/:clubId/events/:eventId', deleteEvent);

// Add/Delete news
router.post('/:id/news', addNews);
router.delete('/:clubId/news/:newsId', deleteNews);

module.exports = router;