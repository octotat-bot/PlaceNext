const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Company = require('../models/Company');
const ResumeReview = require('../models/ResumeReview');
const { analyzeResume } = require('../utils/ai');
const { createNotification } = require('../utils/notifications');
const fs = require('fs');
const path = require('path');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
const getProfile = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found. Please complete your profile.',
                hasProfile: false,
            });
        }

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create or update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateProfile = async (req, res, next) => {
    try {
        const {
            name,
            rollNumber,
            branch,
            semester,
            cgpa,
            backlogs,
            phone,
            skills,
            projects,
            socialLinks,
            about,
        } = req.body;

        let profile = await StudentProfile.findOne({ userId: req.user.id });

        const profileData = {
            userId: req.user.id,
            name,
            rollNumber,
            branch,
            semester,
            cgpa,
            backlogs: backlogs || 0,
            phone,
            skills: skills || [],
            projects: projects || [],
            socialLinks: socialLinks || {},
            about,
        };

        if (profile) {
            // Update existing profile
            profile = await StudentProfile.findOneAndUpdate(
                { userId: req.user.id },
                profileData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new profile
            profile = await StudentProfile.create(profileData);
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload resume
// @route   POST /api/students/resume/upload
// @access  Private (Student)
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file',
            });
        }

        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) {
            // Delete uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile first',
            });
        }

        // Delete old resume if exists
        if (profile.resumeUrl) {
            const oldPath = path.join(__dirname, '..', profile.resumeUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update profile with new resume URL
        profile.resumeUrl = `/uploads/resumes/${req.file.filename}`;
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            resumeUrl: profile.resumeUrl,
        });
    } catch (error) {
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Analyze resume with AI
// @route   POST /api/students/resume/analyze
// @access  Private (Student)
const analyzeResumeAI = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        if (!profile || !profile.resumeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please upload your resume first',
            });
        }

        const resumePath = path.join(__dirname, '..', profile.resumeUrl);

        if (!fs.existsSync(resumePath)) {
            return res.status(404).json({
                success: false,
                message: 'Resume file not found. Please re-upload your resume.',
            });
        }

        // Analyze resume
        const result = await analyzeResume(resumePath);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error,
            });
        }

        // Save analysis to database
        let review = await ResumeReview.findOne({ userId: req.user.id });

        if (review) {
            review.resumeUrl = profile.resumeUrl;
            review.atsScore = result.analysis.atsScore;
            review.aiAnalysis = {
                strengths: result.analysis.strengths,
                weaknesses: result.analysis.weaknesses,
                suggestions: result.analysis.suggestions,
                missingKeywords: result.analysis.missingKeywords,
                improvedBullets: result.analysis.improvedBullets,
            };
            review.analyzedAt = new Date();
            await review.save();
        } else {
            review = await ResumeReview.create({
                studentId: profile._id,
                userId: req.user.id,
                resumeUrl: profile.resumeUrl,
                atsScore: result.analysis.atsScore,
                aiAnalysis: {
                    strengths: result.analysis.strengths,
                    weaknesses: result.analysis.weaknesses,
                    suggestions: result.analysis.suggestions,
                    missingKeywords: result.analysis.missingKeywords,
                    improvedBullets: result.analysis.improvedBullets,
                },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Resume analyzed successfully',
            analysis: {
                atsScore: review.atsScore,
                ...review.aiAnalysis,
                analyzedAt: review.analyzedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get latest resume analysis
// @route   GET /api/students/resume/analysis
// @access  Private (Student)
const getResumeAnalysis = async (req, res, next) => {
    try {
        const review = await ResumeReview.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });

        if (!review) {
            return res.status(200).json({
                success: true,
                analysis: null,
            });
        }

        res.status(200).json({
            success: true,
            analysis: {
                atsScore: review.atsScore,
                ...review.aiAnalysis,
                analyzedAt: review.analyzedAt,
                resumeUrl: review.resumeUrl,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get eligible drives for student
// @route   GET /api/students/drives
// @access  Private (Student)
const getEligibleDrives = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        // If no profile, return empty drives with a flag (not an error)
        if (!profile) {
            return res.status(200).json({
                success: true,
                count: 0,
                drives: [],
                profileIncomplete: true,
                message: 'Please complete your profile to see eligible drives',
            });
        }

        // Get all active drives
        const drives = await Drive.find({ driveStatus: 'active' })
            .populate('companyId', 'companyName logoUrl industry')
            .sort({ applicationDeadline: 1 });

        // Check eligibility for each drive
        const drivesWithEligibility = drives.map((drive) => {
            const eligibility = checkEligibility(profile, drive);
            return {
                ...drive.toObject(),
                isEligible: eligibility.isEligible,
                eligibilityReasons: eligibility.reasons,
                hasApplied: profile.appliedDrives.some(id => id.toString() === drive._id.toString()),
            };
        });

        res.status(200).json({
            success: true,
            count: drivesWithEligibility.length,
            drives: drivesWithEligibility,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get drive details
// @route   GET /api/students/drives/:id
// @access  Private (Student)
const getDriveDetails = async (req, res, next) => {
    try {
        const drive = await Drive.findById(req.params.id).populate(
            'companyId',
            'companyName logoUrl industry description website headquarters'
        );

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found',
            });
        }

        const profile = await StudentProfile.findOne({ userId: req.user.id });
        let eligibility = { isEligible: false, reasons: ['Profile not complete'] };
        let hasApplied = false;

        if (profile) {
            eligibility = checkEligibility(profile, drive);
            hasApplied = profile.appliedDrives.some(id => id.toString() === drive._id.toString());
        }

        res.status(200).json({
            success: true,
            drive: {
                ...drive.toObject(),
                isEligible: eligibility.isEligible,
                eligibilityReasons: eligibility.reasons,
                hasApplied,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Apply to a drive
// @route   POST /api/students/apply/:driveId
// @access  Private (Student)
const applyToDrive = async (req, res, next) => {
    try {
        const { driveId } = req.params;
        const { coverLetter } = req.body;

        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile first',
            });
        }

        if (!profile.resumeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please upload your resume first',
            });
        }

        const drive = await Drive.findById(driveId).populate('companyId');
        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found',
            });
        }

        if (drive.driveStatus !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This drive is no longer accepting applications',
            });
        }

        if (new Date(drive.applicationDeadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed',
            });
        }

        // Check eligibility
        const eligibility = checkEligibility(profile, drive);
        if (!eligibility.isEligible) {
            return res.status(400).json({
                success: false,
                message: 'You are not eligible for this drive',
                reasons: eligibility.reasons,
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            driveId,
            studentId: profile._id,
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this drive',
            });
        }

        // Create application
        const application = await Application.create({
            driveId,
            studentId: profile._id,
            userId: req.user.id,
            resumeUrl: profile.resumeUrl,
            coverLetter,
            applicationStatus: 'applied',
            statusHistory: [{ status: 'applied', changedAt: new Date() }],
        });

        // Update profile
        profile.appliedDrives.push(driveId);
        await profile.save();

        // Update drive applicant count
        drive.applicantCount += 1;
        await drive.save();

        // Create notification
        await createNotification({
            userId: req.user.id,
            title: 'Application Submitted',
            message: `Your application for ${drive.roleTitle} at ${drive.companyId.companyName} has been submitted.`,
            type: 'application',
            link: `/applications`,
            sendEmailNotification: true,
            emailTemplate: 'applicationReceived',
            emailData: [profile.name, drive.companyId.companyName, drive.roleTitle],
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get student's applications
// @route   GET /api/students/applications
// @access  Private (Student)
const getApplications = async (req, res, next) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(200).json({
                success: true,
                count: 0,
                applications: [],
            });
        }

        const applications = await Application.find({ studentId: profile._id })
            .populate({
                path: 'driveId',
                populate: {
                    path: 'companyId',
                    select: 'companyName logoUrl industry',
                },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single application details
// @route   GET /api/students/applications/:id
// @access  Private (Student)
const getApplicationDetails = async (req, res, next) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate({
            path: 'driveId',
            populate: {
                path: 'companyId',
                select: 'companyName logoUrl industry description website',
            },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        res.status(200).json({
            success: true,
            application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Withdraw application
// @route   PUT /api/students/applications/:id/withdraw
// @access  Private (Student)
const withdrawApplication = async (req, res, next) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate({
            path: 'driveId',
            populate: { path: 'companyId' },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        if (['selected', 'rejected', 'withdrawn'].includes(application.applicationStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw this application',
            });
        }

        application.applicationStatus = 'withdrawn';
        await application.save();

        // Update drive applicant count
        await Drive.findByIdAndUpdate(application.driveId._id, {
            $inc: { applicantCount: -1 },
        });

        // Remove from student's appliedDrives array
        await StudentProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $pull: { appliedDrives: application.driveId._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully',
            application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload profile picture
// @route   POST /api/students/profile/picture
// @access  Private (Student)
const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file',
            });
        }

        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile first',
            });
        }

        // Delete old picture if exists
        if (profile.profilePictureUrl) {
            const oldPath = path.join(__dirname, '..', profile.profilePictureUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        profile.profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: profile.profilePictureUrl,
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// Helper function to check eligibility
function checkEligibility(profile, drive) {
    const reasons = [];
    let isEligible = true;

    const { eligibilityCriteria } = drive;

    // Check CGPA
    if (profile.cgpa < eligibilityCriteria.minCGPA) {
        isEligible = false;
        reasons.push(`CGPA below requirement (Need: ${eligibilityCriteria.minCGPA}, Have: ${profile.cgpa})`);
    }

    // Check branch
    const allowedBranches = eligibilityCriteria.allowedBranches;
    if (!allowedBranches.includes('All') && !allowedBranches.includes(profile.branch)) {
        isEligible = false;
        reasons.push(`Branch not eligible (Allowed: ${allowedBranches.join(', ')})`);
    }

    // Check backlogs
    if (profile.backlogs > (eligibilityCriteria.maxBacklogs || 0)) {
        isEligible = false;
        reasons.push(`Backlogs exceed limit (Max: ${eligibilityCriteria.maxBacklogs || 0}, Have: ${profile.backlogs})`);
    }

    // Check semester
    if (eligibilityCriteria.minSemester && profile.semester < eligibilityCriteria.minSemester) {
        isEligible = false;
        reasons.push(`Semester below requirement (Need: ${eligibilityCriteria.minSemester}, Have: ${profile.semester})`);
    }

    if (isEligible) {
        reasons.push('All eligibility criteria met');
    }

    return { isEligible, reasons };
}

module.exports = {
    getProfile,
    updateProfile,
    uploadResume,
    analyzeResumeAI,
    getResumeAnalysis,
    getEligibleDrives,
    getDriveDetails,
    applyToDrive,
    getApplications,
    getApplicationDetails,
    withdrawApplication,
    uploadProfilePicture,
};
