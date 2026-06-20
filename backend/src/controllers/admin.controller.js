const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const ActivityLog = require('../models/ActivityLog');
const ClassSection = require('../models/ClassSection');
const streakToMarks = require('../utils/streakToMarks');

class AdminController {
  getDashboard = asyncHandler(async (req, res) => {
    const adminId = req.user.schoolId || req.user.userId || req.user._id;
    const schoolObjectId = new mongoose.Types.ObjectId(adminId);
    const schoolAdmin = await User.findById(schoolObjectId).select('name schoolName');
    const schoolName = schoolAdmin?.schoolName || req.user.schoolName;
    const studentMatch = {
      role: 'student',
      $or: [
        { schoolId: schoolObjectId },
        { schoolName }
      ].filter((condition) => Object.values(condition)[0])
    };

    const students = await User.find(studentMatch).select('_id name grade section streak practicalMarks');
    const studentIds = students.map((student) => student._id);
    const totalStudents = students.length;

    if (studentIds.length > 0 && schoolName) {
      await User.updateMany(
        {
          role: 'student',
          schoolName,
          $or: [
            { schoolId: null },
            { schoolId: { $exists: false } }
          ]
        },
        { $set: { schoolId: schoolObjectId } }
      );
    }

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const studentStreaks = students
      .slice()
      .sort((a, b) => (b.practicalMarks?.currentStreak || 0) - (a.practicalMarks?.currentStreak || 0))
      .map((student) => ({
        name: student.name,
        grade: student.grade,
        section: student.section,
        currentStreak: student.practicalMarks?.currentStreak || 0,
        longestStreak: student.practicalMarks?.longestStreak || 0,
        totalLogDays: student.practicalMarks?.totalLogDays || 0,
        lastSyncedAt: student.practicalMarks?.lastSyncedAt || null,
        atRisk: student.practicalMarks?.lastSyncedAt
          ? new Date(student.practicalMarks.lastSyncedAt) < twoDaysAgo
          : true
      }));

    const activityLogs = await ActivityLog.find({
      studentId: { $in: studentIds }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('studentId', 'name grade section');

    let liveActivity = activityLogs.map((entry) => ({
      type: entry.type,
      description: entry.description,
      studentName: entry.studentId?.name || 'Unknown',
      school: schoolName || '',
      createdAt: entry.createdAt
    }));

    if (liveActivity.length === 0) {
      const recentLogs = await DailyLog.find({
        userId: { $in: studentIds }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name grade section');

      liveActivity = recentLogs.map((log) => ({
        type: 'MIRROR',
        description: `${log.userId?.name || 'Unknown'} (Grade ${log.userId?.grade || 'N/A'}) submitted a carbon log`,
        studentName: log.userId?.name || 'Unknown',
        school: schoolName || '',
        createdAt: log.createdAt
      }));
    }

    const [
      totalSchools,
      totalReports,
      emissionAgg,
      schoolPerformance,
      topStudents,
      impactAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'school_admin' }),
      DailyLog.countDocuments({ userId: { $in: studentIds } }),
      DailyLog.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $match: {
            $or: [
              { 'student.schoolId': schoolObjectId },
              { 'student.schoolName': schoolName }
            ].filter((condition) => Object.values(condition)[0])
          }
        },
        {
          $group: {
            _id: null,
            avgEmission: { $avg: '$totalEmissionKg' }
          }
        }
      ]),
      User.aggregate([
        { $match: studentMatch },
        {
          $group: {
            _id: { grade: '$grade', section: '$section' },
            studentCount: { $sum: 1 },
            avgEmissionKg: { $avg: '$totalEmissionKg' },
            avgScore: { $avg: '$practicalMarks.marksAwarded' }
          }
        },
        { $sort: { avgScore: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            className: {
              $concat: [
                'Grade ',
                { $toString: '$_id.grade' },
                ' - ',
                { $ifNull: ['$_id.section', 'A'] }
              ]
            },
            studentCount: 1,
            avgEmissionKg: { $round: ['$avgEmissionKg', 1] },
            avgScore: { $round: ['$avgScore', 0] }
          }
        }
      ]),
      User.find(
        studentMatch,
        {
          name: 1,
          grade: 1,
          section: 1,
          'practicalMarks.marksAwarded': 1,
          schoolId: 1
        }
      )
        .sort({ 'practicalMarks.marksAwarded': -1 })
        .limit(3)
        .populate('schoolId', 'schoolName'),
      DailyLog.aggregate([
        { $match: { userId: { $in: studentIds } } },
        {
          $group: {
            _id: null,
            totalLogs: { $sum: 1 },
            transportLogs: {
              $sum: {
                $cond: [{ $gt: ['$breakdown.transportKg', 0] }, 1, 0]
              }
            },
            meatFreeLogs: {
              $sum: {
                $cond: [
                  { $in: ['$food.mealType', ['vegetarian', 'vegan']] },
                  1,
                  0
                ]
              }
            },
            targetMetLogs: {
              $sum: {
                $cond: [{ $lte: ['$totalEmissionKg', 3] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalLogs: 1,
            transportLogs: 1,
            meatFreeLogs: 1,
            targetMetLogs: 1
          }
        }
      ])
    ]);

    const avgEmissionKg = parseFloat(
      (emissionAgg[0]?.avgEmission || 0).toFixed(1)
    );

    const gradeDistribution = await User.aggregate([
      { $match: studentMatch },
      {
        $group: {
          _id: '$grade',
          studentCount: { $sum: 1 },
          avgMarks: {
            $avg: '$practicalMarks.marksAwarded'
          },
          avgStreak: {
            $avg: '$practicalMarks.currentStreak'
          },
          avgEmission: {
            $avg: '$practicalMarks.totalLogDays'
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          grade: { $toString: '$_id' },
          studentCount: 1,
          avgMarks: { $round: [{ $ifNull: ['$avgMarks', 0] }, 1] },
          avgStreak: { $round: [{ $ifNull: ['$avgStreak', 0] }, 1] },
          totalLogDays: { $round: [{ $ifNull: ['$avgEmission', 0] }, 0] }
        }
      }
    ]);

    const marksDistribution = await User.aggregate([
      { $match: studentMatch },
      {
        $bucket: {
          groupBy: '$practicalMarks.marksAwarded',
          boundaries: [0, 5, 10, 15, 20],
          default: 'No marks',
          output: {
            count: { $sum: 1 },
            students: { $push: '$name' }
          }
        }
      }
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyActivity = await DailyLog.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          logCount: { $sum: 1 },
          avgEmission: { $avg: '$totalEmissionKg' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          logCount: 1,
          avgEmission: { $round: ['$avgEmission', 1] }
        }
      }
    ]);

    const ranked = schoolPerformance.map((school, index) => ({
      ...school,
      rank: index + 1
    }));

    const impactRow = impactAgg[0] || {
      totalLogs: 0,
      transportLogs: 0,
      meatFreeLogs: 0,
      targetMetLogs: 0
    };

    const targetMetPct = impactRow.totalLogs
      ? Math.round((impactRow.targetMetLogs / impactRow.totalLogs) * 100)
      : 0;
    const transportReduxPct = impactRow.totalLogs
      ? Math.round((impactRow.transportLogs / impactRow.totalLogs) * 100)
      : 0;
    const meatFreeDaysPct = impactRow.totalLogs
      ? Math.round((impactRow.meatFreeLogs / impactRow.totalLogs) * 100)
      : 0;
    const remainingPct = Math.max(
      0,
      100 - transportReduxPct - meatFreeDaysPct
    );

    res.status(200).json({
      schoolName: schoolName || '',
      adminName: schoolAdmin?.name || schoolName || 'Admin',
      studentsEnrolled: totalStudents,
      stats: {
        totalSchools,
        totalStudents,
        avgEmissionKg,
        totalReports
      },
      schoolPerformance: ranked,
      topStudents: topStudents.map((student) => ({
        name: student.name,
        school: student.schoolId?.schoolName || '',
        grade: student.grade,
        section: student.section,
        score: student.practicalMarks?.marksAwarded || 0
      })),
      gradeDistribution,
      marksDistribution: marksDistribution.map((b) => ({
        range:
          b._id === 'No marks'
            ? 'No marks'
            : b._id === 0
              ? '0–4'
              : b._id === 5
                ? '5–9'
                : b._id === 10
                  ? '10–14'
                  : '15–20',
        count: b.count
      })),
      weeklyActivity: weeklyActivity.map((w) => ({
        date: w.date,
        logs: w.logCount,
        avgEmission: w.avgEmission || 0
      })),
      studentStreaks,
      liveActivity,
      systemImpact: {
        targetMetPct,
        transportReduxPct,
        meatFreeDaysPct,
        remainingPct
      }
    });
  });

  getStudents = asyncHandler(async (req, res) => {
    const adminId = req.user.schoolId || req.user.userId || req.user._id;
    const schoolObjectId = mongoose.Types.ObjectId.isValid(adminId)
      ? new mongoose.Types.ObjectId(adminId)
      : null;
    const schoolAdmin = schoolObjectId
      ? await User.findById(schoolObjectId).select('name schoolName')
      : null;
    const schoolName = schoolAdmin?.schoolName || req.user.schoolName;

    const studentMatch = {
      role: 'student',
      $or: [
        ...(schoolObjectId ? [{ schoolId: schoolObjectId }] : []),
        ...(schoolName ? [{ schoolName }] : [])
      ]
    };

    const students = await User.find(studentMatch, {
      name: 1,
      email: 1,
      grade: 1,
      section: 1,
      schoolName: 1,
      locationType: 1,
      isActive: 1,
      createdAt: 1,
      'practicalMarks.currentStreak': 1,
      'practicalMarks.longestStreak': 1,
      'practicalMarks.totalLogDays': 1,
      'practicalMarks.marksAwarded': 1,
      'practicalMarks.lastSyncedAt': 1
    }).sort({ grade: 1, name: 1 });

    const studentIds = students.map((student) => student._id);

    const logCounts = await DailyLog.aggregate([
      { $match: { userId: { $in: studentIds } } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          lastLog: { $max: '$createdAt' }
        }
      }
    ]);

    const logMap = {};
    logCounts.forEach((entry) => {
      logMap[entry._id.toString()] = {
        count: entry.count,
        lastLog: entry.lastLog
      };
    });

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    res.status(200).json(
      students.map((student) => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        section: student.section,
        schoolName: student.schoolName,
        locationType: student.locationType,
        isActive: student.isActive,
        joinedAt: student.createdAt,
        totalLogs: logMap[student._id.toString()]?.count || 0,
        lastLogAt: logMap[student._id.toString()]?.lastLog || null,
        currentStreak: student.practicalMarks?.currentStreak || 0,
        longestStreak: student.practicalMarks?.longestStreak || 0,
        totalLogDays: student.practicalMarks?.totalLogDays || 0,
        marksAwarded: student.practicalMarks?.marksAwarded || 0,
        atRisk: student.practicalMarks?.lastSyncedAt
          ? new Date(student.practicalMarks.lastSyncedAt) < twoDaysAgo
          : true
      }))
    );
  });

  getReports = asyncHandler(async (req, res) => {
    const adminId = req.user.schoolId || req.user.userId || req.user._id;
    const schoolObjectId = mongoose.Types.ObjectId.isValid(adminId)
      ? new mongoose.Types.ObjectId(adminId)
      : null;
    const schoolAdmin = schoolObjectId
      ? await User.findById(schoolObjectId).select('name schoolName')
      : null;
    const schoolName = schoolAdmin?.schoolName || req.user.schoolName;

    const studentMatch = {
      role: 'student',
      $or: [
        ...(schoolObjectId ? [{ schoolId: schoolObjectId }] : []),
        ...(schoolName ? [{ schoolName }] : [])
      ]
    };

    const students = await User.find(studentMatch, { _id: 1 });
    const studentIds = students.map((student) => student._id);

    const logs = await DailyLog.find({
      userId: { $in: studentIds }
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name grade section');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const emissionTrend = await DailyLog.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          avgEmission: { $avg: '$totalEmissionKg' },
          totalLogs: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          avgEmission: { $round: ['$avgEmission', 2] },
          totalLogs: 1
        }
      }
    ]);

    const categoryBreakdown = await DailyLog.aggregate([
      { $match: { userId: { $in: studentIds } } },
      {
        $group: {
          _id: null,
          avgTransport: { $avg: '$breakdown.transportKg' },
          avgFood: { $avg: '$breakdown.foodKg' },
          avgEnergy: { $avg: '$breakdown.energyKg' },
          totalLogs: { $sum: 1 },
          meatFreeDays: {
            $sum: {
              $cond: [{ $in: ['$food.mealType', ['vegetarian', 'vegan']] }, 1, 0]
            }
          }
        }
      }
    ]);

    const breakdown = categoryBreakdown[0] || {
      avgTransport: 0,
      avgFood: 0,
      avgEnergy: 0,
      totalLogs: 0,
      meatFreeDays: 0
    };

    res.status(200).json({
      totalLogs: logs.length,
      emissionTrend,
      categoryBreakdown: {
        transport: parseFloat((breakdown.avgTransport || 0).toFixed(2)),
        food: parseFloat((breakdown.avgFood || 0).toFixed(2)),
        energy: parseFloat((breakdown.avgEnergy || 0).toFixed(2)),
        meatFreeDays: breakdown.meatFreeDays,
        totalLogs: breakdown.totalLogs
      },
      recentLogs: logs.slice(0, 50).map((log) => ({
        studentName: log.userId?.name || 'Unknown',
        grade: log.userId?.grade,
        section: log.userId?.section,
        date: log.createdAt,
        totalEmissionKg: log.totalEmissionKg || 0,
        meatFreeDay: ['vegetarian', 'vegan'].includes(log.food?.mealType),
        transportEmission: log.breakdown?.transportKg || 0
      }))
    });
  });

  getStudentById = asyncHandler(async (req, res) => {
    const adminId = req.user.schoolId || req.user.userId || req.user._id;
    const schoolObjectId = mongoose.Types.ObjectId.isValid(adminId)
      ? new mongoose.Types.ObjectId(adminId)
      : null;
    const schoolAdmin = schoolObjectId
      ? await User.findById(schoolObjectId).select('name schoolName')
      : null;
    const schoolName = schoolAdmin?.schoolName || req.user.schoolName;

    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      $or: [
        ...(schoolObjectId ? [{ schoolId: schoolObjectId }] : []),
        ...(schoolName ? [{ schoolName }] : [])
      ]
    }).select('-passwordHash');

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const dailyLogs = await DailyLog.find({ userId: student._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        dailyLogs,
        streak: student.streak || {},
        practicalMarks: student.practicalMarks || {}
      }
    });
  });

  createClass = asyncHandler(async (req, res) => {
    const { grade, section } = req.body;

    if (!grade || !section) {
      throw new AppError('Grade and section are required', 400);
    }

    const cls = await ClassSection.create({
      schoolId: req.user.schoolId,
      grade,
      section,
      students: []
    });

    res.status(201).json({
      success: true,
      data: cls
    });
  });

  listClasses = asyncHandler(async (req, res) => {
    const classes = await ClassSection.find({ schoolId: req.user.schoolId }).sort({ grade: 1, section: 1 });
    res.status(200).json({
      success: true,
      data: classes
    });
  });

  updateStudentMarks = asyncHandler(async (req, res) => {
    const { marksAwarded } = req.body;
    if (marksAwarded === undefined || Number.isNaN(Number(marksAwarded))) {
      throw new AppError('marksAwarded is required', 400);
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: 'student',
      schoolId: req.user.schoolId
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    student.practicalMarks = {
      ...(student.practicalMarks || {}),
      marksAwarded: Number(marksAwarded),
      manualOverride: {
        value: Number(marksAwarded),
        updatedBy: req.user.email,
        updatedAt: new Date()
      }
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: student.practicalMarks
    });
  });

  getEmissionsReport = asyncHandler(async (req, res) => {
    const students = await User.find({
      role: 'student',
      schoolId: req.user.schoolId
    }).select('_id grade name');

    const studentIds = students.map((student) => student._id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await DailyLog.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            }
          },
          totalEmissionKg: { $sum: '$totalEmissionKg' },
          logCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const byGrade = await DailyLog.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.grade',
          totalEmissionKg: { $sum: '$totalEmissionKg' },
          students: { $addToSet: '$userId' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalEmissionKg = await DailyLog.aggregate([
      {
        $match: {
          userId: { $in: studentIds },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, totalEmissionKg: { $sum: '$totalEmissionKg' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: students.length,
          totalEmissionKg: totalEmissionKg[0]?.totalEmissionKg || 0,
          averagePerStudent: students.length ? (totalEmissionKg[0]?.totalEmissionKg || 0) / students.length : 0
        },
        trend,
        byGrade
      }
    });
  });

  getStreakReport = asyncHandler(async (req, res) => {
    const students = await User.find({
      role: 'student',
      schoolId: req.user.schoolId
    }).select('name email streak practicalMarks');

    const topStreaks = students
      .map((student) => ({
        ...student.toObject(),
        currentStreak: student.streak?.current || 0,
        longestStreak: student.streak?.longest || 0,
        marksAwarded: student.practicalMarks?.marksAwarded || 0
      }))
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 10);

    const atRisk = students.filter((student) => {
      const lastLog = student.streak?.lastLogDate;
      if (!lastLog) return true;
      const lastDate = new Date(lastLog);
      const diff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 1 && diff <= 2;
    });

    res.status(200).json({
      success: true,
      data: {
        topStreaks,
        atRisk
      }
    });
  });

  syncMarks = asyncHandler(async (req, res) => {
    const students = await User.find({
      role: 'student',
      schoolId: req.user.schoolId
    });

    const updatedStudents = await Promise.all(
      students.map(async (student) => {
        const result = streakToMarks({
          currentStreak: student.streak?.current || 0,
          longestStreak: student.streak?.longest || 0,
          totalLogDays: student.practicalMarks?.totalLogDays || 0
        });

        student.practicalMarks = {
          ...(student.practicalMarks || {}),
          ...result,
          lastSyncedAt: new Date()
        };

        await student.save();
        return student;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        synced: updatedStudents.length,
        formula: 'floor(streak / 5) capped at 20'
      }
    });
  });
}

module.exports = new AdminController();
