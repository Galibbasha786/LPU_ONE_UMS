// backend/controllers/campusClubController.js

const CampusClub = require('../models/CampusClub');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to get user by ID from appropriate model
const getUserById = async (userId) => {
  if (!userId) return null;
  
  let user = await Student.findById(userId).select('name email profileImage');
  if (user) return { ...user.toObject(), role: 'student' };
  
  user = await Staff.findById(userId).select('name email profileImage');
  if (user) return { ...user.toObject(), role: 'staff' };
  
  user = await Admin.findById(userId).select('name email profileImage');
  if (user) return { ...user.toObject(), role: 'admin' };
  
  return null;
};

// Simple notification function
const createSimpleNotification = async (userId, title, message, data = {}) => {
  try {
    console.log(`📢 Notification to ${userId}: ${title} - ${message}`);
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// @desc    Get all clubs
// @route   GET /api/campus-clubs
// @access  Public
exports.getAllClubs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const clubs = await CampusClub.find(query).sort({ createdAt: -1 });
    
    const userId = req.user?.id;
    const clubsWithMembership = clubs.map(club => {
      const clubObj = club.toObject();
      const isMember = userId ? club.members?.some(m => m.userId?.toString() === userId) : false;
      clubObj.isMember = isMember || false;
      clubObj.memberCount = club.members?.length || 0;
      return clubObj;
    });
    
    res.json({
      success: true,
      clubs: clubsWithMembership
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clubs', error: error.message });
  }
};

// @desc    Get club by ID
// @route   GET /api/campus-clubs/:id
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    const club = await CampusClub.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const userId = req.user?.id;
    const isMember = userId ? club.members?.some(m => m.userId?.toString() === userId) : false;
    
    res.json({
      success: true,
      club: {
        ...club.toObject(),
        isMember,
        memberCount: club.members?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch club', error: error.message });
  }
};

// @desc    Create club (Admin only)
// @route   POST /api/campus-clubs
// @access  Private/Admin
exports.createClub = async (req, res) => {
  try {
    const {
      name,
      shortName,
      description,
      category,
      logo,
      coverImage,
      foundedDate,
      motto,
      vision,
      mission,
      facultyAdvisor,
      studentCoordinators,
      socialLinks,
      meetingSchedule
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, description and category are required' 
      });
    }
    
    // Check if club already exists
    const existingClub = await CampusClub.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ success: false, message: 'Club with this name already exists' });
    }
    
    // Generate slug from name
    const slug = generateSlug(name);
    
    // Check if slug already exists
    const existingSlug = await CampusClub.findOne({ slug });
    if (existingSlug) {
      // Append random number if slug exists
      const uniqueSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      slug = uniqueSlug;
    }
    
    const club = new CampusClub({
      name,
      slug, // Add the generated slug
      shortName,
      description,
      category,
      logo: logo || 'https://via.placeholder.com/150',
      coverImage: coverImage || 'https://via.placeholder.com/1200x300',
      foundedDate,
      motto,
      vision,
      mission,
      facultyAdvisor,
      studentCoordinators,
      socialLinks,
      meetingSchedule,
      createdBy: req.user?.id || null,
      members: [],
      events: [],
      news: [],
      achievements: [],
      isActive: true
    });
    
    await club.save();
    
    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ success: false, message: 'Failed to create club', error: error.message });
  }
};

// @desc    Update club (Admin only)
// @route   PUT /api/campus-clubs/:id
// @access  Private/Admin
exports.updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If name is being updated, generate new slug
    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }
    
    const club = await CampusClub.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    res.json({
      success: true,
      message: 'Club updated successfully',
      club
    });
  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({ success: false, message: 'Failed to update club', error: error.message });
  }
};

// @desc    Delete club (Admin only)
// @route   DELETE /api/campus-clubs/:id
// @access  Private/Admin
exports.deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await CampusClub.findByIdAndDelete(id);
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({ success: false, message: 'Failed to delete club', error: error.message });
  }
};

// @desc    Add event to club (Admin only)
// @route   POST /api/campus-clubs/:id/events
// @access  Private/Admin
exports.addEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    
    if (!eventData.title || !eventData.date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event title and date are required' 
      });
    }
    
    const club = await CampusClub.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const newEvent = {
      ...eventData,
      createdBy: req.user?.id || null,
      createdAt: new Date(),
      status: 'upcoming',
      currentParticipants: 0,
      participants: []
    };
    
    club.events.push(newEvent);
    await club.save();
    
    // Send notifications to all club members
    if (club.members && club.members.length > 0) {
      console.log(`📢 Sending event notification to ${club.members.length} members of ${club.name}`);
      for (const member of club.members) {
        if (member.userId) {
          await createSimpleNotification(
            member.userId,
            `New Event: ${eventData.title}`,
            `${club.name} is organizing ${eventData.title} on ${new Date(eventData.date).toLocaleDateString()}`,
            { clubId: club._id, clubName: club.name }
          );
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Event added successfully',
      event: club.events[club.events.length - 1]
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ success: false, message: 'Failed to add event', error: error.message });
  }
};

// @desc    Update event (Admin only)
// @route   PUT /api/campus-clubs/:clubId/events/:eventId
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const { clubId, eventId } = req.params;
    const updates = req.body;
    
    const club = await CampusClub.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const event = club.events.id(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    Object.assign(event, updates);
    await club.save();
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

// @desc    Delete event (Admin only)
// @route   DELETE /api/campus-clubs/:clubId/events/:eventId
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const { clubId, eventId } = req.params;
    
    const club = await CampusClub.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    club.events = club.events.filter(e => e._id.toString() !== eventId);
    await club.save();
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};

// @desc    Add news to club (Admin only)
// @route   POST /api/campus-clubs/:id/news
// @access  Private/Admin
exports.addNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, importance, images } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'News title and content are required' 
      });
    }
    
    const club = await CampusClub.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const newNews = {
      title,
      content,
      type: type || 'announcement',
      importance: importance || 'normal',
      images: images || [],
      createdBy: req.user?.id || null,
      createdAt: new Date()
    };
    
    club.news.unshift(newNews);
    await club.save();
    
    if (club.members && club.members.length > 0) {
      console.log(`📢 Sending news notification to ${club.members.length} members of ${club.name}`);
      for (const member of club.members) {
        if (member.userId) {
          await createSimpleNotification(
            member.userId,
            `${club.name}: ${title}`,
            content.substring(0, 200),
            { clubId: club._id, clubName: club.name, importance }
          );
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'News added successfully',
      news: club.news[0]
    });
  } catch (error) {
    console.error('Error adding news:', error);
    res.status(500).json({ success: false, message: 'Failed to add news', error: error.message });
  }
};

// @desc    Delete news (Admin only)
// @route   DELETE /api/campus-clubs/:clubId/news/:newsId
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
  try {
    const { clubId, newsId } = req.params;
    
    const club = await CampusClub.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    club.news = club.news.filter(n => n._id.toString() !== newsId);
    await club.save();
    
    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, message: 'Failed to delete news', error: error.message });
  }
};

// @desc    Join club
// @route   POST /api/campus-clubs/:id/join
// @access  Private
exports.joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const club = await CampusClub.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const isMember = club.members?.some(m => m.userId?.toString() === userId);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member of this club' });
    }
    
    club.members.push({
      userId: userId,
      role: 'member',
      joinedAt: new Date()
    });
    
    await club.save();
    
    await createSimpleNotification(
      userId,
      `Welcome to ${club.name}!`,
      `You've successfully joined ${club.name}. Check out upcoming events and news!`,
      { clubId: club._id, clubName: club.name }
    );
    
    res.json({
      success: true,
      message: 'Successfully joined the club'
    });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ success: false, message: 'Failed to join club', error: error.message });
  }
};

// @desc    Leave club
// @route   POST /api/campus-clubs/:id/leave
// @access  Private
exports.leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const club = await CampusClub.findById(id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    club.members = club.members.filter(m => m.userId?.toString() !== userId);
    await club.save();
    
    res.json({
      success: true,
      message: 'Successfully left the club'
    });
  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({ success: false, message: 'Failed to leave club', error: error.message });
  }
};

// @desc    Register for event
// @route   POST /api/campus-clubs/:clubId/events/:eventId/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const { clubId, eventId } = req.params;
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    const club = await CampusClub.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const event = club.events.id(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const isRegistered = event.participants?.some(p => p.userId?.toString() === userId);
    if (isRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    
    event.participants.push({
      userId: userId,
      registeredAt: new Date()
    });
    event.currentParticipants = (event.currentParticipants || 0) + 1;
    
    await club.save();
    
    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ success: false, message: 'Failed to register for event', error: error.message });
  }
};

// @desc    Get club news
// @route   GET /api/campus-clubs/:id/news
// @access  Private
exports.getClubNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await CampusClub.findById(id).select('news');
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    res.json({
      success: true,
      news: club.news || []
    });
  } catch (error) {
    console.error('Error fetching club news:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
  }
};

// @desc    Get club events
// @route   GET /api/campus-clubs/:id/events
// @access  Private
exports.getClubEvents = async (req, res) => {
  try {
    const { id } = req.params;
    
    const club = await CampusClub.findById(id).select('events');
    
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    
    const now = new Date();
    const upcomingEvents = club.events.filter(e => new Date(e.date) >= now);
    const pastEvents = club.events.filter(e => new Date(e.date) < now);
    
    res.json({
      success: true,
      upcomingEvents,
      pastEvents
    });
  } catch (error) {
    console.error('Error fetching club events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};