const Student = require('../models/Student');
const Major = require('../models/Major');
const Faculty = require('../models/Faculty');
const Achievement = require('../models/Achievement');
const Distinguish = require('../models/Distinguish');
const Image = require('../models/Image');
const News = require('../models/News');
const Users = require('../models/Users');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const flatten = require('flat');
const ExcelJS = require('exceljs');

module.exports = {
    viewDashboard: async (req, res) => {
        try {
            const achievement = await Achievement.find();
            const student = await Student.find();
            const faculty = await Faculty.find();
            const major = await Major.find();
            
            res.render('admin/dashboard/view_dashboard', {
                title: "Mapres UG | Dashboard",
                achievement,
                student,
                faculty,
                major,
                user: req.session.user,
            });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },
    
    viewSignin: async (req, res) => {
        try {
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            if(req.session.user == null || req.session.user == undefined) {
                res.render('index', {
                    alert,
                    title: 'Mapres | Signin'
                });
            } else {
                res.redirect('/admin/dashboard');
            }
        } catch (error) {
            res.redirect('/admin/signin');
        }
    },
    
    actionSignin: async (req, res) => {
        try {
            const {username, password} = req.body;
            const user = await Users.findOne({username: username});
            if(!user) {
                req.flash('alertMessage', "User can't be found");
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/signin');
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if(!isPasswordMatch) {
                req.flash('alertMessage', `Password invalid!`);
                req.flash('alertStatus', 'danger');
                res.redirect('/admin/signin');
            }
            
            req.session.user = {
                id: user.id,
                username: user.username
            }
            
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.redirect('/admin/signin');
        }
    },
    
    actionLogout: async (req, res) => {
        req.session.destroy();
        res.redirect('/admin/signin');
    },
    
    // Achievement
    viewAchievement: async (req, res) => {
        try {
            const achievement = await Achievement.find()
            .populate({path: 'studentId', select: 'id name'})
            .populate({path: 'facultyId', select: 'id name'})
            .populate({path: 'majorId', select: 'id name'});
            const student = await Student.find()
            .populate({path: 'facultyId', select: 'id name'})
            .populate({path: 'majorId', select: 'id name'});
            const faculty = await Faculty.find();
            const major = await Major.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/achievement/view_achievement', {
                title: "Mapres UG | Beranda Prestasi",
                alert,
                student,
                faculty,
                major,
                achievement,
                action: 'view',
                user: req.session.user
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/achievement');   
        }
    },
    
    addAchievement: async (req, res) => {
        try {
            if(!req.file) {
                req.flash('alertMessage', 'Document not found');
                req.flash('alertStatus', 'danger');
                res.redirect(`/admin/achievement`);
            }
            
            const {studentId, facultyId, majorId, event, participant, scale, type, creation, uniQty, rank, startDate, endDate, document, newsURL} = req.body;
            const student = await Student.findOne({_id: studentId})
            .populate({path: 'facultyId', select: 'id name'})
            .populate({path: 'majorId', select: 'id name'});
            
            const faculty = await Faculty.findOne({_id: facultyId});
            const major = await Major.findOne({_id: majorId});
            
            const newAchievement = {
                studentId: student._id,
                facultyId: faculty._id,
                majorId: major._id,
                event,
                participant,
                scale,
                type,
                creation,
                uniQty,
                rank,
                startDate,
                endDate,
                document,
                newsURL,
                document: `docs/${req.file.filename}`
            }
            
            const achievement = await Achievement.create(newAchievement);
            student.achievementId.push({_id: achievement._id});
            await student.save();
            faculty.achievementId.push({_id: achievement._id});
            await faculty.save();
            major.achievementId.push({_id: achievement._id});
            await major.save();
            
            req.flash('alertMessage', 'Success Add New achievement');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/achievement');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/achievement');
        }
    },
    
    downloadAchievement: async (req, res) => {
        try {
            const raw = await Achievement.find()
            .populate({path: 'studentId', select: 'name npm yearStart'})
            .populate({path: 'facultyId', select: 'name'})
            .populate({path: 'majorId', select: 'name'});
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Achievement Gunadarma');

            const data = JSON.stringify(raw);
            const achievements = JSON.parse(data);
            
            worksheet.columns = [
                {header: 'No',key: 's_no', width:10},
                {header: 'Tahun Masuk',key: 'studentId.yearStart', width:10},
                {header: 'Nama Mahasiswa',key: 'studentId.name', width:10},
                {header: 'NPM',key: 'studentId.npm', width:10},
                {header: 'Fakultas',key: 'facultyId.name', width:10},
                {header: 'Jurusan',key: 'majorId.name', width:10},
                {header: 'Kompetisi',key: 'event', width:10},
                {header: 'Status',key: 'participant', width:10},
                {header: 'Ranking',key: 'rank', width:10},
                {header: 'Skala',key: 'scale', width:10},
                {header: 'Tipe',key: 'type', width:10},
                {header: 'Karya',key: 'creation', width:10},
                {header: 'Universitas Qty',key: 'uniQty', width:10},
                {header: 'Tanggal Awal',key: 'startDate', width:10},
                {header: 'Tanggal Akhir',key: 'endDate', width:10},
            ];
            
            let count = 1;
            
            achievements.forEach(achievement => {
                achievement.s_no = count;
                worksheet.addRow(flatten(achievement));
                count += 1;
            });
            
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {bold:true};
            });
            
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=" + "achievements.xlsx"
                    );
                    
                    return workbook.xlsx.write(res).then(function () {
                        res.status(200).end();
                    });
                    
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/achievement');            
                }
            },
            
            showEditAchievement: async(req, res) => {
                try {
                    const { id } = req.params;
                    const achievement = await Achievement.findOne({_id: id})        
                    .populate({path: 'studentId', select: 'id name'});
                    const student = await Student.find();
                    const alertMessage = req.flash('alertMessage');
                    const alertStatus = req.flash('alertStatus');
                    const alert = {message: alertMessage, status: alertStatus};
                    res.render('admin/achievement/view_achievement', {
                        title: 'Mapres UG | Edit Prestasi',
                        alert,
                        achievement,
                        student,
                        user: req.session.user,
                        action: 'edit',
                    })
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/achievement')    
                }
            },
            
            editAchievement: async (req, res) => {
                try {
                    const { id } = req.params;
                    const { studentId, facultyId, majorId, event, participant, scale, type, creation, uniQty, rank, newsURL } = req.body;
                    const achievement = await Achievement.findOne({_id: id});
                    
                    if(req.file === undefined) {
                        achievement.studentId = studentId;
                        achievement.facultyId = facultyId;
                        achievement.majorId = majorId;
                        achievement.event = event;
                        achievement.participant = participant;
                        achievement.scale = scale;
                        achievement.type = type;
                        achievement.type = type;
                        achievement.creation = creation;
                        achievement.uniQty = uniQty;
                        achievement.rank = rank;
                        achievement.newsURL = newsURL;
                        await achievement.save();
                        req.flash('alertMessage', 'Success Update New Achievement');
                        req.flash('alertStatus', 'success');
                        res.redirect('/admin/achievement');
                    } else {
                        await fs.unlink(path.join(`public/${achievement.document}`));
                        achievement.studentId = studentId;
                        achievement.facultyId = facultyId;
                        achievement.majorId = majorId;
                        achievement.event = event;
                        achievement.participant = participant;
                        achievement.scale = scale;
                        achievement.type = type;
                        achievement.type = type;
                        achievement.creation = creation;
                        achievement.uniQty = uniQty;
                        achievement.rank = rank;
                        achievement.newsURL = newsURL;
                        achievement.document = `docs/${req.file.filename}`;
                        
                        await achievement.save();
                        req.flash('alertMessage', 'Success Update Achievement');
                        req.flash('alertStatus', 'success');
                        res.redirect('/admin/achievement');
                    }
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/achievement');
                }
            },
            
            deleteAchievement: async (req, res) => {
                try {
                    const { id } = req.params;
                    const achievement = await Achievement.findOne({_id: id});
                    const student = await Student.findOne({ _id: achievement.studentId }).populate('achievementId');
                    const faculty = await Faculty.findOne({ _id: achievement.facultyId }).populate('achievementId');
                    const major = await Major.findOne({ _id: achievement.majorId }).populate('achievementId');
                    
                    for(let i = 0; i < student.achievementId.length; i++) {
                        if(student.achievementId[i]._id.toString() === achievement._id.toString()) {
                            student.achievementId.pull({ _id: achievement._id });
                            await student.save();
                        }
                    }
                    for(let i = 0; i < faculty.achievementId.length; i++) {
                        if(faculty.achievementId[i]._id.toString() === achievement._id.toString()) {
                            faculty.achievementId.pull({ _id: achievement._id });
                            await faculty.save();
                        }
                    }
                    for(let i = 0; i < major.achievementId.length; i++) {
                        if(major.achievementId[i]._id.toString() === achievement._id.toString()) {
                            major.achievementId.pull({ _id: achievement._id });
                            await major.save();
                        }
                    }
                    
                    await achievement.remove();
                    req.flash('alertMessage', 'Success Delete achievement');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/achievement');
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/achievement');
                }
            },
            
            // Student
            viewStudent: async (req, res) => {
                try {
                    const student = await Student.find().populate({path: 'facultyId', select: 'id name'}).populate({path: 'majorId', select: 'id name'});
                    const faculty = await Faculty.find();
                    const major = await Major.find().populate({path: 'facultyId', select: 'id name'});
                    const alertMessage = req.flash('alertMessage');
                    const alertStatus = req.flash('alertStatus');
                    const alert = {message: alertMessage, status: alertStatus};
                    res.render('admin/student/view_student', {
                        title: "Mapres UG | Beranda Mahasiswa",
                        faculty,
                        major,
                        alert,
                        student,
                        user: req.session.user,
                        action: 'view'
                    })
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/student');   
                }
            },
            
            addStudent: async (req, res) => {
                try {
                    if(!req.file) {
                        req.flash('alertMessage', 'Image not found');
                        req.flash('alertStatus', 'danger');
                        res.redirect(`/admin/student`);
                    }
                    const {facultyId, majorId, name, npm, email, telp, yearStart} = req.body;
                    const faculty = await Faculty.findOne({_id: facultyId});
                    const major = await Major.findOne({_id: majorId});
                    const newStudent = {
                        facultyId: faculty._id,
                        majorId: major._id,
                        name,
                        npm,
                        email,
                        telp,
                        yearStart,
                        image: `images/${req.file.filename}`
                    }
                    const student = await Student.create(newStudent);
                    faculty.studentId.push({_id: student._id});
                    major.studentId.push({_id: student._id});
                    await faculty.save();
                    await major.save();
                    req.flash('alertMessage', 'Success Add New News');
                    req.flash('alertStatus', 'success');
                    res.redirect('/admin/student');
                } catch (error) {
                    req.flash('alertMessage', `${error.message}`);
                    req.flash('alertStatus', 'danger');
                    res.redirect('/admin/student')    
                }
            },
            
            downloadStudent: async (req, res) => {
                try {
                    const raw = await Student.find()
                    .populate({path: 'facultyId', select: 'name'})
                    .populate({path: 'majorId', select: 'name'});
                    
                    const workbook = new ExcelJS.Workbook();
                    const worksheet = workbook.addWorksheet('student Gunadarma');

                    const data = JSON.stringify(raw);
                    const students = JSON.parse(data);
                    
                    worksheet.columns = [
                        {header: 'No',key: 's_no', width:10},
                        {header: 'Fakultas',key: 'facultyId.name', width:10},
                        {header: 'Jurusan',key: 'majorId.name', width:10},
                        {header: 'Nama Mahasiswa',key: 'name', width:10},
                        {header: 'NPM',key: 'npm', width:10},
                        {header: 'Email',key: 'email', width:10},
                        {header: 'Telp',key: 'telp', width:10},
                        {header: 'Tahun Masuk',key: 'yearStart', width:10},
                    ];
                    
                    let count = 1;
                    students.forEach(student => {
                        student.s_no = count;
                        worksheet.addRow(flatten(student));
                        count += 1;
                    });
                    
                    worksheet.getRow(1).eachCell((cell) => {
                        cell.font = {bold:true};
                    });
                    
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                        res.setHeader(
                            "Content-Disposition",
                            "attachment; filename=" + "students.xlsx"
                            );
                            
                            return workbook.xlsx.write(res).then(function () {
                                res.status(200).end();
                            });
                            
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/student');            
                        }
                    },
                    
                    showEditStudent: async(req, res) => {
                        try {
                            const { id } = req.params;
                            const student = await Student.findOne({_id: id})
                            .populate({path: 'facultyId', select: 'id name'})
                            .populate({path: 'majorId', select: 'id name'});
                            const faculty = await Faculty.find();
                            const major = await Major.find();
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/student/view_student', {
                                title: 'Mapres UG | Edit Mahasiswa',
                                faculty,
                                major,
                                alert,
                                student,
                                user: req.session.user,
                                action: 'edit',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/student')    
                        }
                    },
                    
                    editStudent: async (req, res) => {
                        try {
                            const {id} = req.params;
                            const { name, npm, email, noTelp } = req.body;
                            const student = await Student.findOne({_id: id})
                            .populate({path: 'facultyId', select: 'id name'})
                            .populate({path: 'majorId', select: 'id name'});
                            
                            if(req.file === undefined) {
                                student.name = name;
                                student.npm = npm;
                                student.email = email;
                                student.noTelp = noTelp;
                                
                                await student.save();
                                req.flash('alertMessage', 'Success Update New Student');
                                req.flash('alertStatus', 'success');
                                res.redirect('/admin/student');
                            } else {
                                await fs.unlink(path.join(`public/${student.image}`));
                                student.name = name;
                                student.npm = npm;
                                student.email = email;
                                student.noTelp = noTelp;
                                student.image = `images/${req.file.filename}`;
                                await student.save();
                                req.flash('alertMessage', 'Success Update Student');
                                req.flash('alertStatus', 'success');
                                res.redirect('/admin/student');
                            }
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/student')
                        }
                    },
                    
                    deleteStudent: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const student = await Student.findOne({_id: id});
                            const faculty = await Faculty.findOne({_id: student.facultyId}).populate('studentId');
                            const major = await Major.findOne({_id: student.majorId}).populate('studentId');
                            for(let i = 0; i < faculty.studentId.length; i++) {
                                if(faculty.studentId[i]._id.toString() === student._id.toString()) {
                                    faculty.studentId.pull({ _id: student._id });
                                    await faculty.save();
                                }
                            }
                            for(let i = 0; i < major.studentId.length; i++) {
                                if(major.studentId[i]._id.toString() === student._id.toString()) {
                                    major.studentId.pull({ _id: student._id });
                                    await major.save();
                                }
                            }
                            await fs.unlink(path.join(`public/${student.image}`));
                            await student.remove();
                            req.flash('alertMessage', 'Success Delete Students');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/student');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/student');
                        }
                    },
                    
                    // Faculty
                    viewFaculty: async (req, res) => {
                        try {
                            const faculty = await Faculty.find()
                            .populate({ path: 'imageId', select: 'id image' })
                            .populate({path: 'majorId', select: 'id name'});
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/faculty/view_faculty', {
                                title: "Mapres UG | Beranda Fakultas",
                                alert,
                                faculty,
                                user: req.session.user,
                                action: 'view',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/faculty');   
                        }
                    },
                    
                    addFaculty: async (req, res) => {
                        try {
                            const {name, stand, about} = req.body;
                            if(req.files.length > 0) {
                                const newFaculty = {
                                    name,
                                    stand,
                                    about
                                }
                                const faculties = await Faculty.create(newFaculty);
                                for(let i = 0; i < req.files.length; i++) {
                                    const imageSave = await Image.create({image: `images/${req.files[i].filename}`});
                                    faculties.imageId.push({_id: imageSave._id});
                                    await faculties.save();
                                }
                            }
                            req.flash('alertMessage', 'Success Add Faculty');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/faculty');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/faculty')    
                        }
                    },
                    
                    showEditFaculty: async(req, res) => {
                        try {
                            const { id } = req.params;
                            const faculty = await Faculty.findOne({_id: id})
                            .populate({path: 'imageId', select: 'id image'});
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/faculty/view_faculty', {
                                title: 'Mapres UG | Edit Fakultas',
                                alert,
                                faculty,
                                user: req.session.user,
                                action: 'edit',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/faculty')    
                        }
                    },
                    
                    editFaculty: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const { name, stand, about } = req.body;
                            const faculties = await Faculty.findOne({_id: id})
                            .populate({path: 'imageId', select: 'id image'});
                            
                            if(req.files.length > 0) {
                                for(let i = 0; i < faculties.imageId.length; i++) {
                                    const imageUpdate = await Image.findOne({_id: faculties.imageId[i]._id});
                                    await fs.unlink(path.join(`public/${imageUpdate.image}`));
                                    imageUpdate.image = `images/${req.files[i].filename}`;
                                    await imageUpdate.save();  
                                }
                                faculties.name = name;
                                faculties.stand = stand;
                                faculties.about = about;
                                await faculties.save();
                                req.flash('alertMessage', 'Success Update Faculty');
                                req.flash('alertStatus', 'success'); 
                                res.redirect('/admin/faculty');
                            } else {
                                faculties.name = name;
                                faculties.stand = stand;
                                faculties.about = about;
                                await faculties.save();
                                req.flash('alertMessage', 'Success Update Faculty');
                                req.flash('alertStatus', 'success'); 
                                res.redirect('/admin/faculty');
                            }
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/faculty');
                        }
                    },
                    
                    deleteFaculty: async (req, res) => {
                        try {
                            const {id} = req.params;
                            const faculties = await Faculty.findOne({_id: id}).populate('imageId');
                            for(let i = 0; i < faculties.imageId.length; i++) {
                                Image.findOne({_id: faculties.imageId[i]._id}).then((imageSelected) => {
                                    fs.unlink((path.join(`public/${imageSelected.image}`)));
                                    imageSelected.remove();
                                }).catch((error) => {
                                    req.flash('alertMessage', `${error.message}`);
                                    req.flash('alertStatus', 'danger');
                                    res.redirect('/admin/faculty');  
                                })
                            }
                            await faculties.remove();
                            req.flash('alertMessage', 'Success Delete Faculty');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/faculty');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/faculty');
                        }
                    },
                    
                    // Major
                    viewMajor: async (req, res) => {
                        try {
                            const major = await Major.find().populate({path: 'facultyId', select: 'id name'});
                            const faculty = await Faculty.find();
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/major/view_major', {
                                title: "Mapres UG | Beranda Jurusan",
                                faculty,
                                alert,
                                major,
                                user: req.session.user,
                                action: 'view'
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/major');   
                        }
                    },
                    
                    addMajor: async (req, res) => {
                        try {
                            const {facultyId, code, name} = req.body;
                            const faculty = await Faculty.findOne({_id: facultyId});
                            const newMajor = {
                                facultyId: faculty._id,
                                code,
                                name
                            }
                            const major = await Major.create(newMajor);
                            faculty.majorId.push({_id: major._id});
                            await faculty.save();
                            req.flash('alertMessage', 'Success Add New major');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/major');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/major');
                        }
                    },
                    
                    showEditMajor: async(req, res) => {
                        try {
                            const { id } = req.params;
                            const major = await Major.findOne({_id: id}).populate({path: 'facultyId', select: 'id name'});
                            const faculty = await Faculty.find();
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/major/view_major', {
                                title: 'Mapres UG | Edit Major',
                                alert,
                                major,
                                faculty,
                                user: req.session.user,
                                action: 'edit',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/major')    
                        }
                    },
                    
                    editMajor: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const { facultyId, name, code } = req.body;
                            const major = await Major.findOne({_id: id}).populate({path: 'facultyId', select: 'id name'});
                            
                            major.name = name;
                            major.code = code;
                            major.facultyId = facultyId;
                            
                            await major.save();
                            
                            req.flash('alertMessage', 'Success Update Major');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/major');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/major')
                        }
                    },
                    
                    deleteMajor: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const major = await Major.findOne({_id: id});
                            const faculty = await Faculty.findOne({ _id: major.facultyId }).populate('majorId');
                            for(let i = 0; i < faculty.majorId.length; i++) {
                                if(faculty.majorId[i]._id.toString() === major._id.toString()) {
                                    faculty.majorId.pull({ _id: major._id });
                                    await faculty.save();
                                }
                            }
                            await major.remove();
                            req.flash('alertMessage', 'Success Delete Major');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/major');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/major');
                        }
                    },
                    
                    // News
                    viewNews: async (req, res) => {
                        try {
                            const news = await News.find();
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/news/view_news', {
                                title: "Mapres UG | Beranda Berita",
                                alert,
                                news,
                                user: req.session.user,
                                action: 'view',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/news');   
                        }
                    },
                    
                    addNews: async (req, res) => {
                        try {
                            if(!req.file) {
                                req.flash('alertMessage', 'Image not found');
                                req.flash('alertStatus', 'danger');
                                res.redirect(`/admin/news`);
                            }
                            const {topic, headline, about} = req.body;
                            await News.create({
                                topic,
                                headline,
                                about,
                                image: `images/${req.file.filename}`
                            });
                            req.flash('alertMessage', 'Success Add New News');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/news');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/news');
                        }
                    },
                    
                    showEditNews: async(req, res) => {
                        try {
                            const { id } = req.params;
                            const news = await News.findOne({_id: id});
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/news/view_news', {
                                title: 'Mapres UG | Edit Berita',
                                alert,
                                news,
                                user: req.session.user,
                                action: 'edit',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/news')    
                        }
                    },
                    
                    editNews: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const { topic, headline, about } = req.body;
                            const news = await News.findOne({_id: id});
                            
                            if(req.file === undefined) {
                                news.headline = headline;
                                news.about = about;
                                news.topic = topic;
                                await news.save();
                                req.flash('alertMessage', 'Success Update New News');
                                req.flash('alertStatus', 'success');
                                res.redirect('/admin/news');
                            } else {
                                await fs.unlink(path.join(`public/${news.image}`));
                                news.headline = headline;
                                news.about = about;
                                news.topic = topic;
                                news.image = `images/${req.file.filename}`;
                                await news.save();
                                req.flash('alertMessage', 'Success Update News');
                                req.flash('alertStatus', 'success');
                                res.redirect('/admin/news');
                            }
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/news');
                        }
                    },
                    
                    deleteNews: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const news = await News.findOne({_id: id});
                            
                            await fs.unlink(path.join(`public/${news.image}`));
                            await news.remove();
                            req.flash('alertMessage', 'Success Delete News');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/news');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/news');
                        }
                    },
                    
                    // Distinguish
                    viewDistinguish: async (req, res) => {
                        try {
                            const distinguish = await Distinguish.find()
                            .populate({
                                path: 'studentId', select: 'id name yearStart',
                                populate: {
                                    path: 'facultyId', select: 'id name',
                                },
                            })
                            const student = await Student.find().populate({path: 'majorId', select: 'id name'});
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/distinguish/view_distinguish', {
                                title: "Mapres UG | Beranda Mahasiswa Berprestasi",
                                alert,
                                student,
                                distinguish,
                                user: req.session.user,
                                action: 'view'
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/distinguish');   
                        }
                    },
                    
                    addDistinguish: async (req, res) => {
                        try {
                            const {studentId, about, best} = req.body;
                            const student = await Student.findOne({_id: studentId});
                            const newDistinguish = {
                                studentId: student._id,
                                about,
                                best
                            }
                            const distinguish = await Distinguish.create(newDistinguish);
                            student.distinguishId.push({_id: distinguish._id});
                            await student.save();
                            req.flash('alertMessage', 'Success Add New Distinguish');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/distinguish');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/distinguish');
                        }
                    },
                    
                    showEditDistinguish: async(req, res) => {
                        try {
                            const { id } = req.params;
                            const distinguish = await Distinguish.findOne({_id: id}).populate({path: 'studentId'});
                            const alertMessage = req.flash('alertMessage');
                            const alertStatus = req.flash('alertStatus');
                            const alert = {message: alertMessage, status: alertStatus};
                            res.render('admin/distinguish/view_distinguish', {
                                title: 'Mapres UG | Edit Mahasiswa Berprestasi',
                                alert,
                                distinguish,
                                user: req.session.user,
                                action: 'edit',
                            })
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/distinguish')    
                        }
                    },
                    
                    editDistinguish: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const { best, about } = req.body;
                            const distinguish = await Distinguish.findOne({_id: id}).populate({path: 'studentId'});
                            
                            distinguish.best = best;
                            distinguish.about = about;
                            
                            await distinguish.save();
                            
                            req.flash('alertMessage', 'Success Update Distinguish');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/distinguish');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/distinguish')
                        }
                    },
                    
                    deleteDistinguish: async (req, res) => {
                        try {
                            const { id } = req.params;
                            const distinguish = await Distinguish.findOne({_id: id});
                            const student = await Student.findOne({ _id: distinguish.studentId }).populate('distinguishId');
                            for(let i = 0; i < student.distinguishId.length; i++) {
                                if(student.distinguishId[i]._id.toString() === distinguish._id.toString()) {
                                    student.distinguishId.pull({ _id: distinguish._id });
                                    await student.save();
                                }
                            }
                            await distinguish.remove();
                            req.flash('alertMessage', 'Success Delete distinguish');
                            req.flash('alertStatus', 'success');
                            res.redirect('/admin/distinguish');
                        } catch (error) {
                            req.flash('alertMessage', `${error.message}`);
                            req.flash('alertStatus', 'danger');
                            res.redirect('/admin/distinguish');
                        }
                    }
                    
                }