// controllers/statsController.js - Updated to show English terms for admin
const User = require('../models/User');
const Profile = require('../models/Profile');
const Internship = require('../models/Internship');
const Sector = require('../models/Sector');
const offlineTranslationService = require('../utils/offlineTranslationService');

// Helper function to normalize terms to English for admin display
const normalizeTermsToEnglish = (profiles, fieldName) => {
  const termCounts = {};
  
  profiles.forEach(profile => {
    const userLanguage = profile.language || 'en-IN';
    const terms = profile[fieldName] || [];
    
    terms.forEach(term => {
      // Translate term to English if it's in a regional language
      const englishTerm = offlineTranslationService.translateTerm(term, userLanguage);
      const normalizedTerm = englishTerm.toLowerCase().trim();
      
      if (normalizedTerm && normalizedTerm.length > 1) {
        termCounts[normalizedTerm] = (termCounts[normalizedTerm] || 0) + 1;
      }
    });
  });
  
  return Object.entries(termCounts)
    .map(([term, count]) => ({ _id: term, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to normalize location terms
const normalizeLocationTermsToEnglish = (profiles) => {
  const locationCounts = {};
  
  profiles.forEach(profile => {
    const userLanguage = profile.language || 'en-IN';
    const locations = profile.preferred_locations || [];
    
    locations.forEach(location => {
      // Translate location to English
      const englishLocation = offlineTranslationService.translateTerm(location, userLanguage);
      const normalizedLocation = englishLocation
        .toLowerCase()
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); // Capitalize each word for city names
      
      if (normalizedLocation && normalizedLocation.length > 1) {
        locationCounts[normalizedLocation] = (locationCounts[normalizedLocation] || 0) + 1;
      }
    });
  });
  
  return Object.entries(locationCounts)
    .map(([location, count]) => ({ _id: location, count }))
    .sort((a, b) => b.count - a.count);
};

// GET ADMIN DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        // Basic counts
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalInternships = await Internship.countDocuments();
        const totalSectors = await Sector.countDocuments();
        const completedProfiles = await User.countDocuments({ 
            role: 'user', 
            isProfileComplete: true 
        });

        // Internship statistics
        const activeInternships = await Internship.countDocuments({ status: 'Active' });
        const pausedInternships = await Internship.countDocuments({ status: 'Paused' });
        const closedInternships = await Internship.countDocuments({ status: 'Closed' });
        const remoteInternships = await Internship.countDocuments({ remote_ok: true });

        // Date calculations for recent data
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Recent registrations
        const newUsersThisWeek = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: lastWeek }
        });

        const newUsersThisMonth = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: lastMonth }
        });

        // Recent internships
        const newInternshipsThisWeek = await Internship.countDocuments({
            createdAt: { $gte: lastWeek }
        });

        const newInternshipsThisMonth = await Internship.countDocuments({
            createdAt: { $gte: lastMonth }
        });

        // Internships expiring soon (next 7 days)
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiringSoon = await Internship.countDocuments({
            applicationDeadline: { $gte: now, $lte: nextWeek },
            status: 'Active'
        });

        // Profile completion rate
        const profileCompletionRate = totalUsers > 0 ? 
            Math.round((completedProfiles / totalUsers) * 100) : 0;

        // Email notification stats
        const profilesWithEmailNotifications = await Profile.countDocuments({ 
            notificationsEnabled: true 
        });
        const emailNotificationRate = totalUsers > 0 ? 
            Math.round((profilesWithEmailNotifications / totalUsers) * 100) : 0;

        res.json({
            overview: {
                totalUsers,
                totalAdmins,
                totalInternships,
                totalSectors,
                completedProfiles,
                profileCompletionRate,
                emailNotificationRate
            },
            internships: {
                total: totalInternships,
                active: activeInternships,
                paused: pausedInternships,
                closed: closedInternships,
                remote: remoteInternships,
                expiringSoon
            },
            recent: {
                newUsersThisWeek,
                newUsersThisMonth,
                newInternshipsThisWeek,
                newInternshipsThisMonth
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard statistics', 
            error: error.message 
        });
    }
};

// GET DETAILED USER ANALYTICS - UPDATED for English terms
exports.getUserAnalytics = async (req, res) => {
    try {
        // User growth over last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            {
                $match: {
                    role: 'user',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Get all profiles for term normalization
        const profiles = await Profile.find({}).select('skills preferred_locations language');

        // Top skills - normalized to English
        const topSkills = normalizeTermsToEnglish(profiles, 'skills').slice(0, 10);

        // Top sector interests with names - already in English from sector collection
        const topSectorInterests = await Profile.aggregate([
            { $unwind: '$sector_interests' },
            {
                $lookup: {
                    from: 'sectors',
                    localField: 'sector_interests',
                    foreignField: '_id',
                    as: 'sectorInfo'
                }
            },
            { $unwind: '$sectorInfo' },
            {
                $group: {
                    _id: '$sectorInfo._id',
                    name: { $first: '$sectorInfo.name' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Location distribution - normalized to English
        const locationStats = normalizeLocationTermsToEnglish(profiles).slice(0, 15);

        // Language distribution
        const languageStats = await Profile.aggregate([
            {
                $group: {
                    _id: '$language',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Email notification adoption
        const emailNotificationStats = await Profile.aggregate([
            {
                $group: {
                    _id: '$notificationsEnabled',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            userGrowth,
            topSkills,
            topSectorInterests,
            locationStats,
            languageStats,
            emailNotificationStats
        });

    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching user analytics', 
            error: error.message 
        });
    }
};

// GET INTERNSHIP ANALYTICS - UPDATED for English terms
exports.getInternshipAnalytics = async (req, res) => {
    try {
        // Internships by sector with names
        const sectorStats = await Internship.aggregate([
            { $unwind: '$sectors' },
            {
                $lookup: {
                    from: 'sectors',
                    localField: 'sectors',
                    foreignField: '_id',
                    as: 'sectorInfo'
                }
            },
            { $unwind: '$sectorInfo' },
            {
                $group: {
                    _id: '$sectorInfo._id',
                    name: { $first: '$sectorInfo.name' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top companies posting internships
        const topCompanies = await Internship.aggregate([
            {
                $group: {
                    _id: '$company',
                    count: { $sum: 1 },
                    activeCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
                    },
                    remoteCount: {
                        $sum: { $cond: ['$remote_ok', 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Skills demand analysis - normalized to English
        const allInternships = await Internship.find({}).select('skills_required');
        const skillsDemand = normalizeSkillsFromInternships(allInternships).slice(0, 15);

        // Internship creation timeline (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const internshipTimeline = await Internship.aggregate([
            {
                $match: {
                    createdAt: { $gte: threeMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Stipend analysis
        const stipendStats = await Internship.aggregate([
            {
                $group: {
                    _id: null,
                    avgStipend: { 
                        $avg: { 
                            $cond: [
                                { $gt: ['$stipend.amount', 0] }, 
                                '$stipend.amount', 
                                null
                            ]
                        }
                    },
                    minStipend: { $min: '$stipend.amount' },
                    maxStipend: { $max: '$stipend.amount' },
                    totalWithStipend: {
                        $sum: { $cond: [{ $gt: ['$stipend.amount', 0] }, 1, 0] }
                    },
                    totalUnpaid: {
                        $sum: { $cond: [{ $lte: ['$stipend.amount', 0] }, 1, 0] }
                    }
                }
            }
        ]);

        // Location distribution
        const locationStats = await Internship.aggregate([
            {
                $group: {
                    _id: '$location',
                    count: { $sum: 1 },
                    remoteAvailable: {
                        $sum: { $cond: ['$remote_ok', 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        // Duration analysis
        const durationStats = await Internship.aggregate([
            {
                $group: {
                    _id: '$duration',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            sectorStats,
            topCompanies,
            skillsDemand,
            locationStats,
            durationStats,
            internshipTimeline,
            stipendStats: stipendStats[0] || {
                avgStipend: 0,
                minStipend: 0,
                maxStipend: 0,
                totalWithStipend: 0,
                totalUnpaid: 0
            }
        });

    } catch (error) {
        console.error('Error fetching internship analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching internship analytics', 
            error: error.message 
        });
    }
};

// Helper function to normalize skills from internships (they should already be in English)
const normalizeSkillsFromInternships = (internships) => {
    const skillCounts = {};
    
    internships.forEach(internship => {
        const skills = internship.skills_required || [];
        skills.forEach(skill => {
            const normalizedSkill = skill.toLowerCase().trim();
            if (normalizedSkill && normalizedSkill.length > 1) {
                skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
            }
        });
    });
    
    return Object.entries(skillCounts)
        .map(([skill, count]) => ({ _id: skill, count }))
        .sort((a, b) => b.count - a.count);
};

// GET EMAIL NOTIFICATION STATS
exports.getNotificationStats = async (req, res) => {
    try {
        // Count profiles with email notifications enabled
        const profilesWithEmailNotifications = await Profile.countDocuments({
            notificationsEnabled: true
        });

        // Total profiles
        const totalProfiles = await Profile.countDocuments();
        
        // Users with valid email addresses
        const usersWithEmail = await User.countDocuments({
            role: 'user',
            email: { $exists: true, $ne: '' }
        });

        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Email notification coverage rates
        const emailCoverage = totalUsers > 0 ? 
            Math.round((profilesWithEmailNotifications / totalUsers) * 100) : 0;
            
        const emailValidityRate = totalUsers > 0 ? 
            Math.round((usersWithEmail / totalUsers) * 100) : 0;

        // Internships with email notification history
        const internshipsWithNotifications = await Internship.countDocuments({
            notifiedUsers: { $exists: true, $not: { $size: 0 } }
        });

        // Language distribution for email notifications
        const emailNotificationsByLanguage = await Profile.aggregate([
            {
                $match: {
                    notificationsEnabled: true
                }
            },
            {
                $group: {
                    _id: '$language',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Recent notification activity (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentNotificationActivity = await Internship.countDocuments({
            notifiedUsers: { $exists: true, $not: { $size: 0 } },
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            profilesWithEmailNotifications,
            usersWithEmail,
            totalUsers,
            totalProfiles,
            emailCoverage,
            emailValidityRate,
            internshipsWithNotifications,
            emailNotificationsByLanguage,
            recentNotificationActivity,
            notificationType: 'email'
        });

    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({ 
            message: 'Error fetching notification statistics', 
            error: error.message 
        });
    }
};

// GET SYSTEM HEALTH STATS
exports.getSystemHealth = async (req, res) => {
    try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Active internships with upcoming deadlines (with sector names)
        const upcomingDeadlines = await Internship.find({
            status: 'Active',
            applicationDeadline: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
        })
        .populate('sectors', 'name')
        .select('title company location sectors applicationDeadline')
        .limit(10);

        // Recent system activity
        const recentLogins = await User.countDocuments({
            updatedAt: { $gte: yesterday }
        });

        // Data quality checks
        const incompleteProfiles = await User.countDocuments({
            role: 'user',
            isProfileComplete: false
        });

        const internshipsWithoutDeadlines = await Internship.countDocuments({
            applicationDeadline: { $exists: false }
        });

        // Users without email addresses
        const usersWithoutEmail = await User.countDocuments({
            role: 'user',
            $or: [
                { email: { $exists: false } },
                { email: '' }
            ]
        });

        // Profiles without sector interests
        const profilesWithoutSectors = await Profile.countDocuments({
            $or: [
                { sector_interests: { $exists: false } },
                { sector_interests: { $size: 0 } }
            ]
        });

        // Internships without sectors
        const internshipsWithoutSectors = await Internship.countDocuments({
            $or: [
                { sectors: { $exists: false } },
                { sectors: { $size: 0 } }
            ]
        });

        res.json({
            upcomingDeadlines,
            recentActivity: {
                recentLogins
            },
            dataQuality: {
                incompleteProfiles,
                internshipsWithoutDeadlines,
                usersWithoutEmail,
                profilesWithoutSectors,
                internshipsWithoutSectors
            }
        });

    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({ 
            message: 'Error fetching system health', 
            error: error.message 
        });
    }
};

// GET SECTOR ANALYTICS
exports.getSectorAnalytics = async (req, res) => {
    try {
        // All sectors with usage statistics
        const sectorAnalytics = await Sector.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'sector_interests',
                    as: 'interestedProfiles'
                }
            },
            {
                $lookup: {
                    from: 'internships',
                    localField: '_id',
                    foreignField: 'sectors',
                    as: 'internships'
                }
            },
            {
                $project: {
                    name: 1,
                    profileCount: { $size: '$interestedProfiles' },
                    internshipCount: { $size: '$internships' },
                    activeInternshipCount: {
                        $size: {
                            $filter: {
                                input: '$internships',
                                cond: { $eq: ['$$this.status', 'Active'] }
                            }
                        }
                    }
                }
            },
            {
                $sort: { profileCount: -1 }
            }
        ]);

        // Sector demand vs supply ratio
        const sectorDemandSupply = sectorAnalytics.map(sector => ({
            ...sector,
            demandSupplyRatio: sector.internshipCount > 0 ? 
                Math.round((sector.profileCount / sector.internshipCount) * 100) / 100 : 
                sector.profileCount
        }));

        res.json({
            sectorAnalytics,
            sectorDemandSupply
        });

    } catch (error) {
        console.error('Error fetching sector analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching sector analytics', 
            error: error.message 
        });
    }
};

module.exports = exports;