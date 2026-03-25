const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// @desc    Upload marks
// @route   POST /api/marks/upload
// @access  Private/Faculty
exports.uploadMarks = async (req, res) => {
  try {
    const { studentId, subjectId, internalMarks, externalMarks, examType } = req.body;
    
    const student = await Student.findOne({ studentId });
    const subject = await Subject.findById(subjectId);
    const faculty = await Faculty.findOne({ user: req.user.id });
    
    if (!student || !subject) {
      return res.status(404).json({
        success: false,
        message: 'Student or Subject not found'
      });
    }
    
    const marks = await Marks.findOneAndUpdate(
      { student: student._id, subject: subjectId, examType },
      {
        student: student._id,
        subject: subjectId,
        semester: student.semester,
        internalMarks,
        externalMarks,
        recordedBy: faculty._id,
        examType
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      data: marks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Bulk upload marks
// @route   POST /api/marks/bulk-upload
// @access  Private/Faculty
exports.bulkUploadMarks = async (req, res) => {
  try {
    const { subjectId, examType, marksList } = req.body;
    
    const subject = await Subject.findById(subjectId);
    const faculty = await Faculty.findOne({ user: req.user.id });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    const results = [];
    for (const item of marksList) {
      const student = await Student.findOne({ studentId: item.studentId });
      if (student) {
        const marks = await Marks.findOneAndUpdate(
          { student: student._id, subject: subjectId, examType },
          {
            student: student._id,
            subject: subjectId,
            semester: student.semester,
            internalMarks: item.internalMarks || 0,
            externalMarks: item.externalMarks || 0,
            assignmentMarks: item.assignmentMarks || 0,
            quizMarks: item.quizMarks || 0,
            labMarks: item.labMarks || 0,
            midtermMarks: item.midtermMarks || 0,
            recordedBy: faculty._id,
            examType
          },
          { upsert: true, new: true }
        );
        results.push(marks);
      }
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get student marks report
// @route   GET /api/marks/report
// @access  Private/Faculty
exports.getMarksReport = async (req, res) => {
  try {
    const { subjectId, semester, studentId } = req.query;
    
    let query = {};
    if (subjectId) query.subject = subjectId;
    if (semester) query.semester = semester;
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) query.student = student._id;
    }
    
    const marks = await Marks.find(query)
      .populate('student')
      .populate('subject')
      .sort('-semester');
    
    // Calculate statistics
    const stats = {
      totalStudents: marks.length,
      averageMarks: 0,
      highestMarks: 0,
      lowestMarks: 100,
      gradeDistribution: {
        O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, P: 0, F: 0
      }
    };
    
    let totalMarks = 0;
    marks.forEach(mark => {
      totalMarks += mark.totalMarks;
      stats.highestMarks = Math.max(stats.highestMarks, mark.totalMarks);
      stats.lowestMarks = Math.min(stats.lowestMarks, mark.totalMarks);
      stats.gradeDistribution[mark.grade]++;
    });
    
    stats.averageMarks = marks.length > 0 ? totalMarks / marks.length : 0;
    
    res.status(200).json({
      success: true,
      data: marks,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};