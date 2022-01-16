const Achievement = require("../models/Achievement");
const Distinguish = require("../models/Distinguish");
const Faculty = require("../models/Faculty");
const News = require("../models/News");
const Major = require("../models/Major");
const Student = require("../models/Student");

module.exports = {
    landingPage: async (req, res) => {
        try {
            const news = await News.find()
            .select('_id topic headline image')
            .limit(6);

            const faculty = await Faculty.find()
            .select('_id name stand imageId')
            .limit(9)
            .populate({path: 'imageId', select: 'image', perDocumentLimit: 1});

            const testimonial = {
                _id: "asduh19283h8her89h",
                image: "images/testimonial.png",
                name: "Haikal Ardikatama",
                yearStart: "2018",
                major: "Teknik Informatika",
                content: "Being surrounded by world class academics, many opportunities were open for me that i believe would not be available elsewhere"
            }

            const student = await Student.find();
            const achievement = await Achievement.find();

            res.status(200).json({
                hero: {
                    students: student.length,
                    studentic: 5878,
                    achievements: achievement.length,
                    achievetic: 24738,
                    rank: '26'
                },
                news,
                faculty,
                testimonial
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },

    detailFaculty: async (req, res) => {
        try {
            const { id } = req.params;
            
            const faculty = await Faculty.findOne({_id: id})
            .select('_id name stand about imageId majorId')
            .populate({path: 'imageId', select: '_id image'})
            .populate({
                path: 'majorId', 
                select: '_id name'
             });

            const distinguish = await Faculty.findOne({_id: id})
            .select('_id studentId')
            .limit(3)
            .populate({
                path: 'studentId',
                select: '_id name image',
                match: {
                    distinguishId: {
                        $exists: true, 
                        $type: 'array',
                        $ne: []
                    }
                },
                populate: {
                    path: 'distinguishId',
                    select: '_id about best',
                    match: {
                        best: {$eq: '1st Winner ASEAN-India Hackathon'}
                    },
                }
            });

            const achievement = await Achievement.find({facultyId: {$eq: id }});
            const student = await Student.find({facultyId: {$eq: id }});

            res.status(200).json({
                hero: {
                    achievements: achievement.length,
                    achievetic: 1072,
                    studentic: 860,
                    students: student.length,
                    acreditate: 'A'
                },
                ...faculty._doc,
                distinguish
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    
    allTable: async (req, res) => {
        try {
            const { id } = req.params;

            const academic = await Faculty.findOne({_id: id})
            .select('achievementId')
            .populate({path: 'achievementId'});
            
            res.status(200).json({academic});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    
    academicTable: async (req, res) => {
        try {

            const { id } = req.params;

            const achievement = await Achievement.find({facultyId: id, type: 'Akademik'});

            res.status(200).json({
                achievement
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },

    nonAcademicTable: async (req, res) => {
        try {

            const { id } = req.params;

            const nonAchievement = await Achievement.find({facultyId: id, type: 'NonAkademik'});

            res.status(200).json({
                nonAchievement
            })

        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    
    majorTable: async (req, res) => {
        try {
            const { id } = req.params;

            const major = await Major.findOne({_id: id})
            .select('achievementId')
            .populate({path: 'achievementId'});

            res.status(200).json({major});

        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },

    newsPage: async (req, res) => {
        try {
            const news = await News.find().select('_id topic headline image');    

            res.status(200).json({
                news
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    },
    
    detailNews: async (req, res) => {
        try {
            const { id } = req.params;
            
            const news = await News.findOne({_id: id})
            .select('_id topic headline about image')

            res.status(200).json({news});

        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error"});
        }
    }
}