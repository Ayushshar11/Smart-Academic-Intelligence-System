const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const RiskScore = require('../models/RiskScore');
const Prediction = require('../models/Prediction');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('department')
      .populate({
        path: 'user',
        select: '-password'
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
exports.updateProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update student fields
    const allowedUpdates = ['phone', 'address', 'parentName', 'parentPhone'];
    allowedUpdates.forEach(field => {
      if (req.body[field]) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    // Update user name if provided
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get student attendance
// @route   GET /api/students/attendance
// @access  Private/Student
exports.getAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const { subject, semester } = req.query;
    let query = { student: student._id };

    if (subject) query.subject = subject;
    if (semester) query.semester = semester;

    const attendance = await Attendance.find(query)
      .populate('subject')
      .sort('-date');

    // Calculate attendance summary
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        attendance,
        summary: {
          totalDays,
          presentDays,
          absentDays: attendance.filter(a => a.status === 'absent').length,
          lateDays: attendance.filter(a => a.status === 'late').length,
          attendancePercentage: attendancePercentage.toFixed(2)
        }
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

// @desc    Get student marks
// @route   GET /api/students/marks
// @access  Private/Student
exports.getMarks = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const marks = await Marks.find({ student: student._id })
      .populate('subject')
      .sort('-semester');

    // Calculate CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const mark of marks) {
      const subject = await mark.populate('subject');
      totalGradePoints += mark.gradePoints * subject.subject.credits;
      totalCredits += subject.subject.credits;
    }

    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        marks,
        cgpa,
        totalCredits
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

// @desc    Get student risk assessment
// @route   GET /api/students/risk-assessment
// @access  Private/Student
exports.getRiskAssessment = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const riskScore = await RiskScore.findOne({ student: student._id });

    if (!riskScore) {
      return res.status(404).json({
        success: false,
        message: 'Risk assessment not available yet'
      });
    }

    res.status(200).json({
      success: true,
      data: riskScore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get student predictions
// @route   GET /api/students/predictions
// @access  Private/Student
exports.getPredictions = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const predictions = await Prediction.find({ student: student._id })
      .sort('-semester');

    res.status(200).json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private/Student
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('department');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get recent attendance
    const recentAttendance = await Attendance.find({ student: student._id })
      .populate('subject')
      .sort('-date')
      .limit(10);

    // Get recent marks
    const recentMarks = await Marks.find({ student: student._id })
      .populate('subject')
      .sort('-createdAt')
      .limit(10);

    // Get latest risk score
    const riskScore = await RiskScore.findOne({ student: student._id });

    // Get latest prediction
    const prediction = await Prediction.findOne({ student: student._id })
      .sort('-semester');

    res.status(200).json({
      success: true,
      data: {
        student,
        recentAttendance,
        recentMarks,
        riskScore,
        prediction,
        stats: {
          totalSubjects: await Marks.countDocuments({ student: student._id }),
          attendanceRate: await getAttendanceRate(student._id),
          currentCGPA: await getCurrentCGPA(student._id)
        }
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

// Helper functions
async function getAttendanceRate(studentId) {
  const attendance = await Attendance.find({ student: studentId });
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  return total > 0 ? ((present / total) * 100).toFixed(2) : 0;
}

async function getCurrentCGPA(studentId) {
  const marks = await Marks.find({ student: studentId }).populate('subject');
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const mark of marks) {
    if (mark.subject) {
      totalPoints += mark.gradePoints * mark.subject.credits;
      totalCredits += mark.subject.credits;
    }
  }
  
  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
}