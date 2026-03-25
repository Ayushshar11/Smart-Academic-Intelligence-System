const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Student = require('../models/Student');

class MLService {
  constructor() {
    this.modelLoaded = false;
  }

  async prepareStudentData(studentId) {
    const student = await Student.findById(studentId);
    const attendance = await Attendance.find({ student: studentId });
    const marks = await Marks.find({ student: studentId });
    
    // Calculate metrics
    const attendancePercentage = await this.calculateAttendancePercentage(attendance);
    const assignmentSubmissionRate = await this.calculateAssignmentRate(marks);
    const currentCGPA = await this.calculateCGPA(marks);
    
    return {
      attendance_percentage: attendancePercentage,
      assignment_submission_rate: assignmentSubmissionRate,
      internal_marks: this.calculateAverageInternalMarks(marks),
      previous_cgpa: student.previousCGPA || currentCGPA,
      class_participation: 0.7 // Placeholder
    };
  }

  async prepareRiskData(studentId) {
    const student = await Student.findById(studentId);
    const attendance = await Attendance.find({ student: studentId });
    const marks = await Marks.find({ student: studentId });
    
    const attendancePercentage = await this.calculateAttendancePercentage(attendance);
    const currentCGPA = await this.calculateCGPA(marks);
    const assignmentCompletion = await this.calculateAssignmentRate(marks);
    const gradeTrend = await this.calculateGradeTrend(marks);
    
    return {
      attendancePercentage,
      currentCGPA,
      assignmentCompletion,
      gradeTrend,
      semester: student.semester,
      previousRisk: student.riskScore || 0
    };
  }

  async predictPerformance(data) {
    // Simulate ML prediction
    // In production, this would call actual ML models
    
    const baseScore = (
      data.attendance_percentage * 0.3 +
      data.internal_marks * 0.4 +
      data.assignment_submission_rate * 0.2 +
      data.previous_cgpa * 0.1
    ) / 10;
    
    const predictedCGPA = Math.min(10, Math.max(0, baseScore * 10));
    
    // Determine grade
    let predictedGrade = 'C';
    if (predictedCGPA >= 9) predictedGrade = 'O';
    else if (predictedCGPA >= 8) predictedGrade = 'A+';
    else if (predictedCGPA >= 7) predictedGrade = 'A';
    else if (predictedCGPA >= 6) predictedGrade = 'B+';
    else if (predictedCGPA >= 5) predictedGrade = 'B';
    else if (predictedCGPA >= 4) predictedGrade = 'C';
    else predictedGrade = 'F';
    
    // Generate suggestions
    const suggestions = [];
    if (data.attendance_percentage < 75) {
      suggestions.push('Improve attendance to at least 75%');
    }
    if (data.internal_marks < 60) {
      suggestions.push('Focus on improving internal assessment marks');
    }
    if (data.assignment_submission_rate < 0.8) {
      suggestions.push('Complete all assignments on time');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Maintain current performance and aim for higher grades');
    }
    
    return {
      predictedCGPA: predictedCGPA.toFixed(2),
      predictedGrade,
      confidence: 0.85,
      factors: {
        attendance: data.attendance_percentage,
        currentCGPA: data.previous_cgpa,
        assignmentCompletion: data.assignment_submission_rate
      },
      suggestions,
      weakAreas: this.identifyWeakAreas(data),
      strongAreas: this.identifyStrongAreas(data)
    };
  }

  async calculateRiskScore(data) {
    // Weighted risk calculation
    const riskFactors = {
      attendance: data.attendancePercentage < 75 ? 0.3 : 
                   data.attendancePercentage < 85 ? 0.15 : 0,
      academics: data.currentCGPA < 5 ? 0.4 :
                  data.currentCGPA < 6 ? 0.25 :
                  data.currentCGPA < 7 ? 0.15 : 0,
      assignments: data.assignmentCompletion < 0.7 ? 0.2 :
                    data.assignmentCompletion < 0.85 ? 0.1 : 0,
      gradeTrend: data.gradeTrend < 0 ? 0.1 : 0
    };
    
    const riskScore = Object.values(riskFactors).reduce((a, b) => a + b, 0);
    
    let riskLevel = 'low';
    if (riskScore >= 0.7) riskLevel = 'high';
    else if (riskScore >= 0.4) riskLevel = 'medium';
    
    const recommendations = [];
    if (riskFactors.attendance > 0) {
      recommendations.push('Improve attendance - consider setting reminders for classes');
    }
    if (riskFactors.academics > 0) {
      recommendations.push('Seek academic support - attend tutoring sessions');
    }
    if (riskFactors.assignments > 0) {
      recommendations.push('Complete pending assignments and submit on time');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue with current study habits');
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      dropoutProbability: Math.min(0.95, riskScore * 1.2),
      factors: riskFactors,
      recommendations
    };
  }

  async calculateAttendancePercentage(attendance) {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return (presentCount / attendance.length) * 100;
  }

  async calculateAssignmentRate(marks) {
    if (marks.length === 0) return 0;
    const submittedAssignments = marks.filter(m => m.assignmentMarks > 0).length;
    return submittedAssignments / marks.length;
  }

  async calculateCGPA(marks) {
    if (marks.length === 0) return 0;
    let totalPoints = 0;
    let totalSubjects = 0;
    
    for (const mark of marks) {
      totalPoints += mark.gradePoints;
      totalSubjects++;
    }
    
    return totalSubjects > 0 ? totalPoints / totalSubjects : 0;
  }

  calculateAverageInternalMarks(marks) {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, m) => acc + (m.internalMarks || 0), 0);
    return sum / marks.length;
  }

  calculateGradeTrend(marks) {
    if (marks.length < 2) return 0;
    const recent = marks.slice(-3);
    const older = marks.slice(-6, -3);
    
    const recentAvg = recent.reduce((acc, m) => acc + m.gradePoints, 0) / recent.length;
    const olderAvg = older.reduce((acc, m) => acc + m.gradePoints, 0) / older.length;
    
    return recentAvg - olderAvg;
  }

  identifyWeakAreas(data) {
    const weakAreas = [];
    if (data.attendance_percentage < 75) weakAreas.push('Attendance');
    if (data.internal_marks < 60) weakAreas.push('Internal Assessments');
    if (data.assignment_submission_rate < 0.8) weakAreas.push('Assignment Submission');
    if (data.previous_cgpa < 6) weakAreas.push('Overall Academic Performance');
    return weakAreas;
  }

  identifyStrongAreas(data) {
    const strongAreas = [];
    if (data.attendance_percentage >= 90) strongAreas.push('Excellent Attendance');
    if (data.internal_marks >= 85) strongAreas.push('Strong Internal Performance');
    if (data.assignment_submission_rate >= 0.95) strongAreas.push('Consistent Assignment Submission');
    if (data.previous_cgpa >= 8) strongAreas.push('High Academic Achievement');
    return strongAreas;
  }
}

module.exports = new MLService();