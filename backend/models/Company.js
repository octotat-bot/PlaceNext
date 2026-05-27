const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, 'Please provide company name'],
            trim: true,
        },
        industry: {
            type: String,
            required: true,
            enum: [
                'Technology',
                'Finance',
                'Healthcare',
                'Manufacturing',
                'Consulting',
                'E-commerce',
                'Education',
                'Automotive',
                'Energy',
                'Other',
            ],
        },
        website: {
            type: String,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        logoUrl: {
            type: String,
        },
        contactPerson: {
            name: String,
            email: String,
            phone: String,
        },
        headquarters: {
            type: String,
        },
        employeeCount: {
            type: String,
            enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Company', companySchema);
