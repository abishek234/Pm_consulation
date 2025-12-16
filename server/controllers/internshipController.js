// controllers/internshipController.js
const Internship = require('../models/Internship');
const Profile = require('../models/Profile');
const { sendMatchingNotifications } = require('../utils/notificationService');
const offlineTranslationService = require('../utils/offlineTranslationService');
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Function to process CSV file for internships
const processCSVInternships = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                return reject(err);
            }
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    });
};

// Function to process Excel file for internships
const processExcelInternships = async (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
};

// ADMIN: CREATE NEW INTERNSHIP (Auto-triggers notifications)
exports.createInternship = async (req, res) => {
    try {
        const {
            title, company, location, skills_required, sectors, description,
            remote_ok, duration, stipend, eligibility, applicationDeadline, maxApplications,websiteLink
        } = req.body;

        // Create internship
        const internship = await Internship.create({
            title,
            company,
            location,
            skills_required: skills_required.map(skill => skill.toLowerCase()),
            sectors: sectors.map(sector => sector.toLowerCase()),
            description,
            remote_ok: remote_ok || false,
            duration,
            stipend,
            eligibility,
            applicationDeadline,
            maxApplications: maxApplications || 50,
            websiteLink,
            postedBy: req.user.id
        });

        res.status(201).json({
            message: "Internship created successfully",
            internship: {
                job_id: internship.job_id,
                title: internship.title,
                company: internship.company,
                location: internship.location,
                skills_required: internship.skills_required,
                sectors: internship.sectors,
                remote_ok: internship.remote_ok,
                websiteLink: internship.websiteLink,
            }
        });

        // Auto-trigger notifications (async)
        sendMatchingNotifications(internship._id)
            .then(result => {
                console.log(`Auto-notifications sent for "${title}":`, result);
            })
            .catch(error => {
                console.error(`Auto-notification failed for "${title}":`, error);
            });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating internship', 
            error: error.message 
        });
    }
};

// ADMIN: BULK UPLOAD INTERNSHIPS
// Updated bulkUploadInternships method in internshipController.js
exports.bulkUploadInternships = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const filePath = path.resolve(req.file.path);
        let internships = [];

        const mimetype = req.file.mimetype.toLowerCase();

        if (mimetype === "text/csv") {
            internships = await processCSVInternships(filePath);
        } else if (
            mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            mimetype === "application/vnd.ms-excel"
        ) {
            internships = await processExcelInternships(filePath);
        } else {
            return res.status(400).json({ 
                message: "Invalid file type. Only CSV or Excel files are allowed." 
            });
        }

        const internshipData = internships
            .map((internship, index) => {
                // Required fields validation
                if (!internship.title || !internship.company || !internship.location || 
                    !internship.description || !internship.applicationDeadline) {
                    console.log(`Skipping row ${index + 1} due to missing required fields.`);
                    return null;
                }

                // Parse skills and sectors from comma-separated strings
                const parseArrayField = (field) => {
                    if (!field) return [];
                    return field.toString().split(',').map(item => item.trim().toLowerCase()).filter(item => item);
                };

                // Parse stipend
                const parseStipend = (stipendField) => {
                    if (!stipendField) return { amount: 0, currency: "INR" };
                    const amount = parseFloat(stipendField.toString().replace(/[^\d.]/g, '')) || 0;
                    return { amount, currency: "INR" };
                };

                // Parse eligibility
                const parseEligibility = (educationField) => {
                    return {
                        education: educationField ? parseArrayField(educationField) : [],
                    };
                };

                return {
                    title: internship.title.trim(),
                    company: internship.company.trim(),
                    location: internship.location.trim(),
                    skills_required: parseArrayField(internship.skills_required || internship.skills),
                    sectors: parseArrayField(internship.sectors || internship.sector),
                    description: internship.description.trim(),
                    remote_ok: internship.remote_ok === 'true' || internship.remote_ok === true || 
                              internship.remote_ok === 'yes' || internship.remote_ok === 'Yes',
                    duration: internship.duration || "3 months",
                    stipend: parseStipend(internship.stipend),
                    eligibility: parseEligibility(internship.education),
                    applicationDeadline: new Date(internship.applicationDeadline),
                    maxApplications: parseInt(internship.maxApplications) || 50,
                    websiteLink: internship.websiteLink ? internship.websiteLink.trim() : undefined,
                    postedBy: req.user.id,
                    status: 'Active'
                    // Note: job_id will be auto-generated by the pre-save hook
                };
            })
            .filter((internship) => internship !== null);

        if (internshipData.length === 0) {
            return res.status(400).json({ 
                message: "No valid internship data to upload." 
            });
        }

        // Sequential creation to avoid job_id conflicts
        let insertedCount = 0;
        let notificationPromises = [];
        const errors = [];

        for (let i = 0; i < internshipData.length; i++) {
            const internshipInfo = internshipData[i];
            try {
                // Check for duplicate (same title + company + location)
                const existingInternship = await Internship.findOne({
                    title: internshipInfo.title,
                    company: internshipInfo.company,
                    location: internshipInfo.location
                });

                if (!existingInternship) {
                    // Generate job_id manually for bulk operations
                    const jobId = await Internship.generateJobId();
                    internshipInfo.job_id = jobId;
                    
                    const newInternship = await Internship.create(internshipInfo);
                    insertedCount++;

                    // Queue notification for this internship
                   notificationPromises.push(
                        sendMatchingNotifications(newInternship._id)
                            .then(result => {
                                console.log(`Email notifications sent for "${newInternship.title}":`, {
                                    sent: result.sent,
                                    failed: result.failed,
                                    totalMatches: result.totalMatches
                                });
                                return { internshipId: newInternship._id, success: true, result };
                            })
                            .catch(error => {
                                console.error(`Email notification failed for "${newInternship.title}":`, error);
                                return { internshipId: newInternship._id, success: false, error };
                            })
                    );
                
                } else {
                    console.log(`Skipped "${internshipInfo.title}" at "${internshipInfo.company}" - already exists.`);
                }
            } catch (error) {
                console.error(`Error creating internship: ${internshipInfo.title}`, error);
                errors.push({
                    row: i + 1,
                    title: internshipInfo.title,
                    error: error.message
                });
            }
        }

        // Remove uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({ 
            message: "Internships processed successfully", 
            count: insertedCount,
            total: internshipData.length,
            skipped: internshipData.length - insertedCount,
            errors: errors.length > 0 ? errors : undefined
        });

        // Send notifications in background
        if (notificationPromises.length > 0) {
            Promise.allSettled(notificationPromises)
                .then(results => {
                    const successful = results.filter(r => r.value?.success).length;
                    const failed = results.filter(r => !r.value?.success).length;
                    console.log(`Bulk notification summary: ${successful} successful, ${failed} failed`);
                })
                .catch(error => {
                    console.error("Error in bulk notifications:", error);
                });
        }

    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ 
            message: "Error processing file", 
            error: error.message 
        });
    }
};

// GET BULK UPLOAD TEMPLATE
exports.downloadInternshipTemplate = (req, res) => {
    try {
        const templateData = [
            {
                title: "Software Developer Intern",
                company: "Tech Solutions Pvt Ltd",
                location: "Bangalore, Karnataka",
                skills_required: "javascript, react, nodejs",
                sectors: "software, technology",
                description: "Work on web development projects using modern JavaScript frameworks",
                remote_ok: "false",
                duration: "6 months",
                stipend: "15000",
                education: "B.Tech, B.Sc, BCA",
                applicationDeadline: "2025-12-31",
                maxApplications: "30",
                websiteLink: "https://techsolutions.example.com/careers"

            },
            {
                title: "Data Analyst Intern",
                company: "Analytics Corp",
                location: "Mumbai, Maharashtra", 
                skills_required: "python, sql, excel",
                sectors: "analytics, finance",
                description: "Analyze business data and create insights using Python and SQL",
                remote_ok: "true",
                duration: "4 months",
                stipend: "12000",
                education: "B.Tech, B.Sc, MBA",
                applicationDeadline: "2025-11-30",
                maxApplications: "25",
                websiteLink: "https://analyticscorp.example.com/internships"    
            }
        ];

        const ws = xlsx.utils.json_to_sheet(templateData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Internships");

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="internship_upload_template.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ 
            message: "Error generating template", 
            error: error.message 
        });
    }
};

// ADMIN: MANUALLY TRIGGER NOTIFICATIONS
exports.triggerNotifications = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const { minMatchScore } = req.body;

        const result = await sendMatchingNotifications(internshipId, minMatchScore || 50);
        
        res.json({
            message: "Email notifications triggered successfully", // UPDATED message
            notificationType: 'email', // ADDED
            ...result
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error triggering email notifications', // UPDATED message
            error: error.message 
        });
    }
};

// exports.getRecommendations = async (req, res) => {
//     try {
//         const { userId } = req.params;
        
//         // Populate sector_interests to get sector names
//         const profile = await Profile.findOne({ userId }).populate('sector_interests', 'name');
//         if (!profile) {
//             return res.status(404).json({ message: 'Profile not found' });
//         }

//         console.log('Original Profile:', {
//             skills: profile.skills,
//             sector_interests: profile.sector_interests,
//             locations: profile.preferred_locations,
//             education: profile.education,
//             language: profile.language
//         });

//         // Create translation-ready profile with sector names
//         const profileForTranslation = {
//             ...profile.toObject(),
//             sector_interests: profile.sector_interests.map(sector => sector.name)
//         };

//         // Simple instant translation - no API calls
//         const translatedProfile = offlineTranslationService.translateProfile(profileForTranslation);
        
//         console.log('Translated Profile:', {
//             skills: translatedProfile.skills,
//             sector_interests: translatedProfile.sector_interests,
//             locations: translatedProfile.preferred_locations,
//             education: translatedProfile.education
//         });


//         // Fetch internships with populated sectors
//         const internships = await Internship.find({ 
//             status: 'Active',
//             applicationDeadline: { $gte: new Date() }
//         }).populate('sectors', 'name');


//         const recommendations = [];
        
//         internships.forEach(internship => {
//             let score = 0;
//             let matchDetails = {
//                 skillMatches: 0,
//                 totalSkills: internship.skills_required.length,
//                 locationMatch: false,
//                 sectorMatches: 0,
//                 totalSectors: internship.sectors.length
//             };
            
//             // Skills matching (40%) - Enhanced with offline translation
//             let skillMatches = 0;
//             internship.skills_required.forEach(requiredSkill => {
//                 if (offlineTranslationService.enhancedMatch(
//                     requiredSkill, 
//                     translatedProfile.skills, 
//                     profile.language
//                 )) {
//                     skillMatches++;
//                 }
//             });
            
//             matchDetails.skillMatches = skillMatches;
//             const skillScore = internship.skills_required.length > 0 ? 
//                 (skillMatches / internship.skills_required.length) * 40 : 0;
            
//             // Location matching (30%) - Enhanced with offline translation
//             let locationMatch = false;
//             translatedProfile.preferred_locations.forEach(userLocation => {
//                 if (offlineTranslationService.enhancedMatch(
//                     userLocation,
//                     [internship.location],
//                     profile.language
//                 )) {
//                     locationMatch = true;
//                 }
//             });
            
//             matchDetails.locationMatch = locationMatch;
//             const locationScore = (locationMatch) ? 30 : 0;
            
//             // Sector interest matching (30%) - Updated for sector references
//             let sectorMatches = 0;
//             const userSectorNames = translatedProfile.sector_interests; // Already translated sector names
//             const internshipSectorNames = internship.sectors.map(s => s.name.toLowerCase());
            
//             internshipSectorNames.forEach(internshipSector => {
//                 if (userSectorNames.some(userSector => {
//                     // Direct match or enhanced match with translation
//                     return userSector.toLowerCase() === internshipSector ||
//                            offlineTranslationService.enhancedMatch(
//                                internshipSector,
//                                [userSector],
//                                profile.language
//                            );
//                 })) {
//                     sectorMatches++;
//                 }
//             });
            
//             matchDetails.sectorMatches = sectorMatches;
//             const sectorScore = internship.sectors.length > 0 ? 
//                 (sectorMatches / internship.sectors.length) * 30 : 0;
            
//             score = skillScore + locationScore + sectorScore;
            
//             // Lower threshold for better results
//             if (score > 15) { // Lowered threshold since we have more precise sector matching
//                 recommendations.push({
//                     ...internship.toObject(),
//                     matchScore: Math.round(score),
//                     matchDetails: {
//                         skills: `${matchDetails.skillMatches}/${matchDetails.totalSkills} skills matched`,
//                         location: matchDetails.locationMatch ? 
//                             "Location matched" : 
//                             "Location not matched",
//                         sectors: `${matchDetails.sectorMatches}/${matchDetails.totalSectors} sectors matched`,
//                         translationMethod: "Offline mapping with sector references"
//                     }
//                 });
//             }
//         });

//         recommendations.sort((a, b) => b.matchScore - a.matchScore);
//         const top5 = recommendations.slice(0, 5);

//         res.json({
//             message: `Found ${recommendations.length} matching internships`,
//             language: profile.language,
//             translationStats: offlineTranslationService.getStats(),
//             userSectors: profile.sector_interests.map(s => s.name), // For debugging
//             recommendations: top5.map(rec => ({
//                 job_id: rec.job_id,
//                 title: rec.title,
//                 company: rec.company,
//                 location: rec.location,
//                 skills_required: rec.skills_required,
//                 sectors: rec.sectors.map(s => ({ _id: s._id, name: s.name })), // Return populated sectors
//                 description: rec.description,
//                 remote_ok: rec.remote_ok,
//                 duration: rec.duration,
//                 stipend: rec.stipend,
//                 matchScore: rec.matchScore,
//                 matchDetails: rec.matchDetails,
//                 websiteLink: rec.websiteLink,
//                 applicationDeadline: rec.applicationDeadline
//             }))
//         });

//     } catch (error) {
//         console.error('Error getting recommendations:', error);
//         res.status(500).json({ 
//             message: 'Error getting recommendations', 
//             error: error.message 
//         });
//     }
// };

// exports.getRecommendations = async (req, res) => {
//     try {
//         const { userId } = req.params;
        
//         // Populate sector_interests to get sector names
//         const profile = await Profile.findOne({ userId }).populate('sector_interests', 'name');
//         if (!profile) {
//             return res.status(404).json({ message: 'Profile not found' });
//         }

//         console.log('Original Profile:', {
//             skills: profile.skills,
//             sector_interests: profile.sector_interests,
//             locations: profile.preferred_locations,
//             education: profile.education,
//             language: profile.language
//         });

//         // Create translation-ready profile with sector names
//         const profileForTranslation = {
//             ...profile.toObject(),
//             sector_interests: profile.sector_interests.map(sector => sector.name)
//         };

//         // Simple instant translation - no API calls
//         const translatedProfile = offlineTranslationService.translateProfile(profileForTranslation);
        
//         console.log('Translated Profile:', {
//             skills: translatedProfile.skills,
//             sector_interests: translatedProfile.sector_interests,
//             locations: translatedProfile.preferred_locations,
//             education: translatedProfile.education
//         });

//         // Fetch all active internships with populated sectors
//         const allInternships = await Internship.find({ 
//             status: 'Active',
//             applicationDeadline: { $gte: new Date() }
//         }).populate('sectors', 'name');

//         console.log(`Total active internships: ${allInternships.length}`);

//         // STEP 1: ELIGIBILITY FILTERING
//         const eligibleInternships = [];
//         const ineligibleInternships = [];

//         allInternships.forEach(internship => {
//             // Check education eligibility
//             const eligibilityResult = offlineTranslationService.checkEducationEligibility(
//                 translatedProfile.education,
//                 internship.eligibility
//             );

//             console.log(`Internship ${internship.job_id} - ${internship.title}:`);
//             console.log(`  Required education: ${internship.eligibility?.education || 'None specified'}`);
//             console.log(`  User education: ${translatedProfile.education}`);
//             console.log(`  Eligible: ${eligibilityResult.eligible}`);
//             console.log(`  Reason: ${eligibilityResult.reason}`);

//             if (eligibilityResult.eligible) {
//                 eligibleInternships.push({
//                     ...internship.toObject(),
//                     eligibilityReason: eligibilityResult.reason
//                 });
//             } else {
//                 ineligibleInternships.push({
//                     job_id: internship.job_id,
//                     title: internship.title,
//                     company: internship.company,
//                     eligibilityReason: eligibilityResult.reason
//                 });
//             }
//         });

//         console.log(`Eligible internships: ${eligibleInternships.length}`);
//         console.log(`Ineligible internships: ${ineligibleInternships.length}`);

//         // STEP 2: RULE-BASED FUZZY ALGORITHM ON ELIGIBLE INTERNSHIPS
//         const recommendations = [];
        
//         eligibleInternships.forEach(internship => {
//             let score = 0;
//             let matchDetails = {
//                 skillMatches: 0,
//                 totalSkills: internship.skills_required.length,
//                 locationMatch: false,
//                 sectorMatches: 0,
//                 totalSectors: internship.sectors.length,
//                 eligibilityStatus: 'Eligible'
//             };
            
//             // Skills matching (40%) - Enhanced with offline translation
//             let skillMatches = 0;
//             internship.skills_required.forEach(requiredSkill => {
//                 if (offlineTranslationService.enhancedMatch(
//                     requiredSkill, 
//                     translatedProfile.skills, 
//                     profile.language
//                 )) {
//                     skillMatches++;
//                 }
//             });
            
//             matchDetails.skillMatches = skillMatches;
//             const skillScore = internship.skills_required.length > 0 ? 
//                 (skillMatches / internship.skills_required.length) * 40 : 0;
            
//             // Location matching (30%) - Enhanced with offline translation
//             let locationMatch = false;
//             translatedProfile.preferred_locations.forEach(userLocation => {
//                 if (offlineTranslationService.enhancedMatch(
//                     userLocation,
//                     [internship.location],
//                     profile.language
//                 )) {
//                     locationMatch = true;
//                 }
//             });
            
//             matchDetails.locationMatch = locationMatch;
//             const locationScore = (locationMatch) ? 30 : 0;
            
//             // Sector interest matching (30%) - Updated for sector references
//             let sectorMatches = 0;
//             const userSectorNames = translatedProfile.sector_interests; // Already translated sector names
//             const internshipSectorNames = internship.sectors.map(s => s.name.toLowerCase());
            
//             internshipSectorNames.forEach(internshipSector => {
//                 if (userSectorNames.some(userSector => {
//                     // Direct match or enhanced match with translation
//                     return userSector.toLowerCase() === internshipSector ||
//                            offlineTranslationService.enhancedMatch(
//                                internshipSector,
//                                [userSector],
//                                profile.language
//                            );
//                 })) {
//                     sectorMatches++;
//                 }
//             });
            
//             matchDetails.sectorMatches = sectorMatches;
//             const sectorScore = internship.sectors.length > 0 ? 
//                 (sectorMatches / internship.sectors.length) * 30 : 0;
            
//             score = skillScore + locationScore + sectorScore;
            
//             console.log(`Internship ${internship.job_id} scoring:`);
//             console.log(`  Skills: ${skillMatches}/${internship.skills_required.length} = ${skillScore}%`);
//             console.log(`  Location: ${locationMatch} = ${locationScore}%`);
//             console.log(`  Sectors: ${sectorMatches}/${internship.sectors.length} = ${sectorScore}%`);
//             console.log(`  Total Score: ${score}%`);

//             // Lower threshold for better results (restored original logic)
//             if (score > 15) { // Lowered threshold since we have more precise matching 
//                 recommendations.push({
//                     ...internship,
//                     matchScore: Math.round(score),
//                     matchDetails: {
//                         skills: `${matchDetails.skillMatches}/${matchDetails.totalSkills} skills matched`,
//                         location: matchDetails.locationMatch ? 
//                             "Location matched" : 
//                             "Location not matched",
//                         sectors: `${matchDetails.sectorMatches}/${matchDetails.totalSectors} sectors matched`,
//                         eligibility: matchDetails.eligibilityStatus,
//                         translationMethod: "Offline mapping with eligibility filtering"
//                     }
//                 });
//             }
//         });

//         // Sort by match score (highest first)
//         recommendations.sort((a, b) => b.matchScore - a.matchScore);
//         const top5 = recommendations.slice(0, 5);

//         res.json({
//             message: `Found ${recommendations.length} eligible internships out of ${allInternships.length} total`,
//             language: profile.language,
//             translationStats: offlineTranslationService.getStats(),
//             userEducation: {
//                 original: profile.education,
//                 translated: translatedProfile.education
//             },
//             eligibilityStats: {
//                 total: allInternships.length,
//                 eligible: eligibleInternships.length,
//                 ineligible: ineligibleInternships.length,
//                 ineligibleReasons: ineligibleInternships.map(i => ({
//                     job_id: i.job_id,
//                     title: i.title,
//                     company: i.company,
//                     reason: i.eligibilityReason
//                 }))
//             },
//             userSectors: profile.sector_interests.map(s => s.name), // For debugging
//             recommendations: top5.map(rec => ({
//                 job_id: rec.job_id,
//                 title: rec.title,
//                 company: rec.company,
//                 location: rec.location,
//                 skills_required: rec.skills_required,
//                 sectors: rec.sectors.map(s => ({ _id: s._id, name: s.name })),
//                 description: rec.description,
//                 remote_ok: rec.remote_ok,
//                 duration: rec.duration,
//                 stipend: rec.stipend,
//                 eligibility: rec.eligibility,
//                 matchScore: rec.matchScore,
//                 matchDetails: rec.matchDetails,
//                 websiteLink: rec.websiteLink,
//                 applicationDeadline: rec.applicationDeadline
//             }))
//         });

//     } catch (error) {
//         console.error('Error getting recommendations:', error);
//         res.status(500).json({ 
//             message: 'Error getting recommendations', 
//             error: error.message 
//         });
//     }
// };

exports.getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Populate sector_interests to get sector names
        const profile = await Profile.findOne({ userId }).populate('sector_interests', 'name');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        console.log('Original Profile:', {
            skills: profile.skills,
            sector_interests: profile.sector_interests,
            locations: profile.preferred_locations,
            education: profile.education,
            language: profile.language
        });

        // Create translation-ready profile with sector names
        const profileForTranslation = {
            ...profile.toObject(),
            sector_interests: profile.sector_interests.map(sector => sector.name)
        };

        // Simple instant translation - no API calls
        const translatedProfile = offlineTranslationService.translateProfile(profileForTranslation);
        
        console.log('Translated Profile:', {
            skills: translatedProfile.skills,
            sector_interests: translatedProfile.sector_interests,
            locations: translatedProfile.preferred_locations,
            education: translatedProfile.education
        });

        // Fetch all active internships with populated sectors
        const allInternships = await Internship.find({ 
            status: 'Active',
            applicationDeadline: { $gte: new Date() }
        }).populate('sectors', 'name');

        console.log(`Total active internships: ${allInternships.length}`);

        // STEP 1: ELIGIBILITY FILTERING WITH DETAILED MATCHING
        const eligibleInternships = [];
        const ineligibleInternships = [];

        allInternships.forEach(internship => {
            // Check education eligibility with detailed results
            const eligibilityResult = offlineTranslationService.checkEducationEligibility(
                translatedProfile.education,
                internship.eligibility
            );

            console.log(`Internship ${internship.job_id} - ${internship.title}:`);
            console.log(`  Required education: ${internship.eligibility?.education || 'None specified'}`);
            console.log(`  User education: ${translatedProfile.education}`);
            console.log(`  Eligible: ${eligibilityResult.eligible}`);
            console.log(`  Matched with: ${eligibilityResult.matchedWith}`);
            console.log(`  Match rule: ${eligibilityResult.matchRule}`);

            if (eligibilityResult.eligible) {
                eligibleInternships.push({
                    ...internship.toObject(),
                    eligibilityInfo: {
                        status: 'Eligible',
                        userEducation: translatedProfile.education,
                        requiredEducation: internship.eligibility?.education || [],
                        matchedWith: eligibilityResult.matchedWith,
                        matchRule: eligibilityResult.matchRule,
                        reason: eligibilityResult.reason,
                        detailedMatch: eligibilityResult.detailedMatch
                    }
                });
            } else {
                ineligibleInternships.push({
                    job_id: internship.job_id,
                    title: internship.title,
                    company: internship.company,
                    eligibilityInfo: {
                        status: 'Not Eligible',
                        userEducation: translatedProfile.education,
                        requiredEducation: internship.eligibility?.education || [],
                        reason: eligibilityResult.reason
                    }
                });
            }
        });

        console.log(`Eligible internships: ${eligibleInternships.length}`);
        console.log(`Ineligible internships: ${ineligibleInternships.length}`);

        // STEP 2: RULE-BASED FUZZY ALGORITHM ON ELIGIBLE INTERNSHIPS
        const recommendations = [];
        
        eligibleInternships.forEach(internship => {
            let score = 0;
            let matchDetails = {
                skillMatches: 0,
                totalSkills: internship.skills_required.length,
                locationMatch: false,
                sectorMatches: 0,
                totalSectors: internship.sectors.length
            };
            
            // Skills matching (40%) - Enhanced with offline translation
            let skillMatches = 0;
            internship.skills_required.forEach(requiredSkill => {
                if (offlineTranslationService.enhancedMatch(
                    requiredSkill, 
                    translatedProfile.skills, 
                    profile.language
                )) {
                    skillMatches++;
                }
            });
            
            matchDetails.skillMatches = skillMatches;
            const skillScore = internship.skills_required.length > 0 ? 
                (skillMatches / internship.skills_required.length) * 40 : 0;
            
            // Location matching (30%) - Enhanced with offline translation
            let locationMatch = false;
            translatedProfile.preferred_locations.forEach(userLocation => {
                if (offlineTranslationService.enhancedMatch(
                    userLocation,
                    [internship.location],
                    profile.language
                )) {
                    locationMatch = true;
                }
            });
            
            matchDetails.locationMatch = locationMatch;
            const locationScore = (locationMatch) ? 30 : 0;
            
            // Sector interest matching (30%) - Updated for sector references
            let sectorMatches = 0;
            const userSectorNames = translatedProfile.sector_interests;
            const internshipSectorNames = internship.sectors.map(s => s.name.toLowerCase());
            
            internshipSectorNames.forEach(internshipSector => {
                if (userSectorNames.some(userSector => {
                    return userSector.toLowerCase() === internshipSector ||
                           offlineTranslationService.enhancedMatch(
                               internshipSector,
                               [userSector],
                               profile.language
                           );
                })) {
                    sectorMatches++;
                }
            });
            
            matchDetails.sectorMatches = sectorMatches;
            const sectorScore = internship.sectors.length > 0 ? 
                (sectorMatches / internship.sectors.length) * 30 : 0;
            
            score = skillScore + locationScore + sectorScore;
            
            console.log(`Internship ${internship.job_id} scoring:`);
            console.log(`  Skills: ${skillMatches}/${internship.skills_required.length} = ${skillScore}%`);
            console.log(`  Location: ${locationMatch} = ${locationScore}%`);
            console.log(`  Sectors: ${sectorMatches}/${internship.sectors.length} = ${sectorScore}%`);
            console.log(`  Total Score: ${score}%`);

            // Apply threshold filter
            if (score > 15) {
                recommendations.push({
                    job_id: internship.job_id,
                    title: internship.title,
                    company: internship.company,
                    location: internship.location,
                    skills_required: internship.skills_required,
                    sectors: internship.sectors,
                    description: internship.description,
                    remote_ok: internship.remote_ok,
                    duration: internship.duration,
                    stipend: internship.stipend,
                    websiteLink: internship.websiteLink,
                    applicationDeadline: internship.applicationDeadline,
                    eligibility: internship.eligibility,
                    matchScore: Math.round(score),
                    matchDetails: {
                        skills: `${matchDetails.skillMatches}/${matchDetails.totalSkills} skills matched`,
                        location: matchDetails.locationMatch ? "Location matched" : "Location not matched",
                        sectors: `${matchDetails.sectorMatches}/${matchDetails.totalSectors} sectors matched`,
                        translationMethod: "Offline mapping with eligibility filtering"
                    },
                    eligibilityDetails: internship.eligibilityInfo
                });
            }
        });

        // Sort by match score (highest first)
        recommendations.sort((a, b) => b.matchScore - a.matchScore);
        const top5 = recommendations.slice(0, 5);

        // Debug logging
        console.log('Final recommendations with eligibility details:');
        top5.forEach(rec => {
            console.log(`${rec.job_id}: ${JSON.stringify(rec.eligibilityDetails, null, 2)}`);
        });

        res.json({
            message: `Found ${recommendations.length} eligible internships out of ${allInternships.length} total`,
            language: profile.language,
            translationStats: offlineTranslationService.getStats(),
            userEducation: {
                original: profile.education,
                translated: translatedProfile.education
            },
            eligibilityStats: {
                total: allInternships.length,
                eligible: eligibleInternships.length,
                ineligible: ineligibleInternships.length,
                ineligibleDetails: ineligibleInternships.map(i => ({
                    job_id: i.job_id,
                    title: i.title,
                    company: i.company,
                    eligibilityInfo: i.eligibilityInfo
                }))
            },
            userSectors: profile.sector_interests.map(s => s.name),
            recommendations: top5.map(recommendation => ({
                job_id: recommendation.job_id,
                title: recommendation.title,
                company: recommendation.company,
                location: recommendation.location,
                skills_required: recommendation.skills_required,
                sectors: recommendation.sectors.map(s => ({ _id: s._id, name: s.name })),
                description: recommendation.description,
                remote_ok: recommendation.remote_ok,
                duration: recommendation.duration,
                stipend: recommendation.stipend,
                eligibility: recommendation.eligibility,
                matchScore: recommendation.matchScore,
                matchDetails: recommendation.matchDetails,
                websiteLink: recommendation.websiteLink,
                applicationDeadline: recommendation.applicationDeadline,
                eligibilityDetails: {
                    status: recommendation.eligibilityDetails.status,
                    userEducation: recommendation.eligibilityDetails.userEducation,
                    requiredEducation: recommendation.eligibilityDetails.requiredEducation,
                    matchedWith: recommendation.eligibilityDetails.matchedWith,
                    matchRule: recommendation.eligibilityDetails.matchRule,
                    reason: recommendation.eligibilityDetails.reason,
                    detailedMatch: recommendation.eligibilityDetails.detailedMatch
                }
            }))
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ 
            message: 'Error getting recommendations', 
            error: error.message 
        });
    }
};


// GET ALL INTERNSHIPS
exports.getAllInternships = async (req, res) => {
    try {
        const { location, skills, sector, remote } = req.query;
        
        let filter = { status: 'Active', applicationDeadline: { $gte: new Date() } };
        
        if (location) filter.location = new RegExp(location, 'i');
        if (skills) filter.skills_required = { $in: skills.split(',').map(s => new RegExp(s, 'i')) };
        if (sector) {
            // Handle sector filtering by name
            const sectorDoc = await Sector.findOne({ name: new RegExp(sector, 'i') });
            if (sectorDoc) {
                filter.sectors = { $in: [sectorDoc._id] };
            }
        }
        if (remote === 'true') filter.remote_ok = true;

        const internships = await Internship.find(filter)
            .populate('sectors', 'name') // Populate sector names
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            total: internships.length,
            internships: internships.map(internship => ({
                _id: internship._id,
                job_id: internship.job_id,
                title: internship.title,
                description: internship.description,
                company: internship.company,
                location: internship.location,
                skills_required: internship.skills_required,
                sectors: internship.sectors, // Now populated with {_id, name}
                remote_ok: internship.remote_ok,
                duration: internship.duration,
                stipend: internship.stipend,
                status: internship.status,
                applicationDeadline: internship.applicationDeadline,
                eligibility: internship.eligibility,
                maxApplications: internship.maxApplications,
                websiteLink: internship.websiteLink,
                posted_date: internship.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching internships', 
            error: error.message 
        });
    }
};

// GET SINGLE INTERNSHIP
exports.getInternshipById = async (req, res) => {
    try {
        const { id } = req.params;
        const internship = await Internship.findById(id);
        
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        res.json(internship);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching internship', 
            error: error.message 
        });
    }
};

// ADMIN: UPDATE INTERNSHIP
exports.updateInternship = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (updates.skills_required) {
            updates.skills_required = updates.skills_required.map(skill => skill.toLowerCase());
        }
        if (updates.sectors) {
            updates.sectors = updates.sectors.map(sector => sector.toLowerCase());
        }
        
        const internship = await Internship.findByIdAndUpdate(id, updates, { new: true });
        
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        
        res.json({ message: 'Internship updated successfully', internship });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating internship', 
            error: error.message 
        });
    }
};

// ADMIN: DELETE INTERNSHIP
exports.deleteInternship = async (req, res) => {
    try {
        const { id } = req.params;
        const internship = await Internship.findByIdAndDelete(id);
        
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        
        res.json({ message: 'Internship deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting internship', 
            error: error.message 
        });
    }
};

module.exports = exports;