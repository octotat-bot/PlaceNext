const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    technologies: [String],
    link: String,
    github: String,
});

const studentProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
        },
        rollNumber: {
            type: String,
            required: [true, 'Please provide your roll number'],
            unique: true,
        },
        branch: {
            type: String,
            required: [true, 'Please provide your branch'],
            enum: [
                'Computer Science',
                'Information Technology',
                'Electronics',
                'Electrical',
                'Mechanical',
                'Civil',
                'Chemical',
                'Biotechnology',
                'Other',
            ],
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8,
        },
        cgpa: {
            type: Number,
            required: [true, 'Please provide your CGPA'],
            min: 0,
            max: 10,
        },
        backlogs: {
            type: Number,
            default: 0,
            min: 0,
        },
        phone: {
            type: String,
            match: [/^[6-9]\d{9}$/, 'Please provide a valid phone number'],
        },
        skills: [
            {
                type: String,
                trim: true,
            },
        ],
        projects: [projectSchema],
        resumeUrl: {
            type: String,
        },
        profilePictureUrl: {
            type: String,
        },
        socialLinks: {
            github: String,
            linkedin: String,
            portfolio: String,
        },
        about: {
            type: String,
            maxlength: 500,
        },
        appliedDrives: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Drive',
            },
        ],
        profileCompleteness: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate profile completeness before saving
studentProfileSchema.pre('save', function () {
    const requiredFields = ['name', 'rollNumber', 'branch', 'semester', 'cgpa', 'phone', 'resumeUrl'];
    const optionalFields = ['skills', 'projects', 'socialLinks.github', 'socialLinks.linkedin', 'about'];

    let filledRequired = 0;
    let filledOptional = 0;

    requiredFields.forEach((field) => {
        if (this[field]) filledRequired++;
    });

    if (this.skills && this.skills.length > 0) filledOptional++;
    if (this.projects && this.projects.length > 0) filledOptional++;
    if (this.socialLinks?.github) filledOptional++;
    if (this.socialLinks?.linkedin) filledOptional++;
    if (this.about) filledOptional++;

    // Required fields are worth 70%, optional 30%
    const requiredScore = (filledRequired / requiredFields.length) * 70;
    const optionalScore = (filledOptional / optionalFields.length) * 30;

    this.profileCompleteness = Math.round(requiredScore + optionalScore);
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
