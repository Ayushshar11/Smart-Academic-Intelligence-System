const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getPredictions,
  getStudentPrediction,
  generatePredictions,
  generateRiskScores,
  getAtRiskStudents,
  getPredictionAnalytics
} = require('../controllers/predictionController');

router.use(protect);

// Routes for faculty and admin
router.get('/', roleMiddleware('faculty', 'admin'), getPredictions);
router.get('/at-risk', roleMiddleware('faculty', 'admin'), getAtRiskStudents);
router.get('/student/:studentId', roleMiddleware('faculty', 'admin'), getStudentPrediction);
router.get('/analytics', roleMiddleware('admin'), getPredictionAnalytics);

// Admin-only routes
router.post('/generate', roleMiddleware('admin'), generatePredictions);
router.post('/generate-risk', roleMiddleware('admin'), generateRiskScores);

module.exports = router;