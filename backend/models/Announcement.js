const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Announcement title is required'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Announcement content is required'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Announcement', announcementSchema);
