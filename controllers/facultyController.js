const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Subject = require('../models/Subject');

// @desc    Get faculty profile
// @route   GET /api/faculty/profile
// @access  Private/Faculty
exports.getProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id })
      .populate('department')
      .populate('subjects')
      .populate({
        path: 'user',
        select: '-password'
      });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get faculty subjects
// @route   GET /api/faculty/subjects
// @access  Private/Faculty
exports.getSubjects = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    const subjects = await Subject.find({ _id: { $in: faculty.subjects } })
      .populate('department');

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get students by subject
// @route   GET /api/faculty/subject/:subjectId/students
// @access  Private/Faculty
exports.getSubjectStudents = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { semester } = req.query;

    const query = { enrollmentStatus: 'active' };
    if (semester) query.semester = semester;

    const students = await Student.find(query)
      .populate('user', 'name email')
      .populate('department');

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get faculty dashboard
// @route   GET /api/faculty/dashboard
// @access  Private/Faculty
exports.getDashboard = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });

    const subjects = await Subject.find({ _id: { $in: faculty.subjects } });
    const totalStudents = await Student.countDocuments({ 
      department: faculty.department 
    });

    const recentAttendance = await Attendance.find({ 
      markedBy: faculty._id 
    })
      .sort('-date')
      .limit(50)
      .populate('student')
      .populate('subject');

    res.status(200).json({
      success: true,
      data: {
        faculty,
        subjects: subjects.length,
        totalStudents,
        recentAttendance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};