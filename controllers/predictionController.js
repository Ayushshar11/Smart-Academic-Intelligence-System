const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const RiskScore = require('../models/RiskScore');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const mlService = require('../services/mlService');

// @desc    Get all predictions for faculty
// @route   GET /api/predictions
// @access  Private/Faculty
exports.getPredictions = async (req, res) => {
  try {
    const { semester, department, riskLevel } = req.query;
    
    let query = {};
    
    if (semester) query.semester = semester;
    if (department) {
      const students = await Student.find({ department }).select('_id');
      query.student = { $in: students };
    }
    if (riskLevel) {
      const riskScores = await RiskScore.find({ riskLevel });
      query.student = { $in: riskScores.map(r => r.student) };
    }
    
    const predictions = await Prediction.find(query)
      .populate('student')
      .populate({
        path: 'student',
        populate: { path: 'department' }
      })
      .sort('-predictionDate');
    
    res.status(200).json({
      success: true,
      count: predictions.length,
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

// @desc    Get prediction for a specific student
// @route   GET /api/predictions/student/:studentId
// @access  Private/Faculty
exports.getStudentPrediction = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const prediction = await Prediction.findOne({ student: studentId })
      .sort('-semester')
      .populate('student');
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'No prediction found for this student'
      });
    }
    
    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Generate predictions for all students
// @route   POST /api/predictions/generate
// @access  Private/Admin
exports.generatePredictions = async (req, res) => {
  try {
    const { semester } = req.body;
    
    // Get all active students
    const students = await Student.find({ enrollmentStatus: 'active' });
    
    const results = [];
    
    for (const student of students) {
      // Get student data for prediction
      const studentData = await mlService.prepareStudentData(student._id);
      
      // Generate prediction using ML model
      const prediction = await mlService.predictPerformance(studentData);
      
      // Save prediction
      const newPrediction = await Prediction.create({
        student: student._id,
        semester: semester || student.semester + 1,
        predictedCGPA: prediction.predictedCGPA,
        predictedGrade: prediction.predictedGrade,
        confidence: prediction.confidence,
        factors: prediction.factors,
        improvementSuggestions: prediction.suggestions,
        weakAreas: prediction.weakAreas,
        strongAreas: prediction.strongAreas
      });
      
      results.push(newPrediction);
    }
    
    res.status(200).json({
      success: true,
      message: `Generated predictions for ${results.length} students`,
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

// @desc    Generate risk scores for all students
// @route   POST /api/predictions/generate-risk
// @access  Private/Admin
exports.generateRiskScores = async (req, res) => {
  try {
    const students = await Student.find({ enrollmentStatus: 'active' });
    
    const results = [];
    
    for (const student of students) {
      // Get student data
      const studentData = await mlService.prepareRiskData(student._id);
      
      // Calculate risk score
      const risk = await mlService.calculateRiskScore(studentData);
      
      // Save or update risk score
      const riskScore = await RiskScore.findOneAndUpdate(
        { student: student._id },
        {
          riskScore: risk.score,
          riskLevel: risk.level,
          factors: risk.factors,
          recommendations: risk.recommendations,
          predictedDropoutProbability: risk.dropoutProbability,
          $push: {
            history: {
              riskScore: risk.score,
              riskLevel: risk.level,
              calculatedAt: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );
      
      // Update student risk level
      student.riskLevel = risk.level;
      student.riskScore = risk.score;
      await student.save();
      
      results.push(riskScore);
    }
    
    res.status(200).json({
      success: true,
      message: `Generated risk scores for ${results.length} students`,
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

// @desc    Get at-risk students
// @route   GET /api/predictions/at-risk
// @access  Private/Faculty
exports.getAtRiskStudents = async (req, res) => {
  try {
    const riskScores = await RiskScore.find({ riskLevel: { $in: ['medium', 'high'] } })
      .populate({
        path: 'student',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'department' }
        ]
      })
      .sort('-riskScore');
    
    res.status(200).json({
      success: true,
      count: riskScores.length,
      data: riskScores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get dashboard analytics for predictions
// @route   GET /api/predictions/analytics
// @access  Private/Admin
exports.getPredictionAnalytics = async (req, res) => {
  try {
    const riskLevels = await RiskScore.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' }
        }
      }
    ]);
    
    const predictionsBySemester = await Prediction.aggregate([
      {
        $group: {
          _id: '$semester',
          avgPredictedCGPA: { $avg: '$predictedCGPA' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        riskLevels,
        predictionsBySemester,
        totalAtRisk: await RiskScore.countDocuments({ riskLevel: 'high' }),
        totalMediumRisk: await RiskScore.countDocuments({ riskLevel: 'medium' })
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