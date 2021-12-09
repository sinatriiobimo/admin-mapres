const Scoop = require('../models/Scoop');
const News = require('../models/News');
const Major = require('../models/Major');
const Faculty = require('../models/Faculty');
const Achieve = require('../models/Achieve');
const Student = require('../models/Student');
const Mapres = require('../models/Mapres');
const Prestasi = require('../models/Prestasi');
const Image = require('../models/Image');
const Users = require('../models/Users');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = {
    viewDashboard: (req, res) => {
        try {
            res.render('admin/dashboard/view_dashboard', {
                title: "Mapres UG | Dashboard",
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
            console.log(user);
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
    
    // Mapres
    viewMapres: async (req, res) => {
        try {
            const mapres = await Mapres.find().populate({path: 'facultyId', select: 'id faculty'}).populate({path: 'studentId', select: 'id name'});
            const faculty = await Faculty.find();
            const students = await Student.find().populate({path: 'majorId', select: 'id name'});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/mapres/view_mapres', {
                title: "Mapres UG | Mapres",
                faculty,
                students,
                alert,
                mapres,
                action: 'view',
                user: req.session.user,
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/mapres');   
        }
    },
    
    addMapres: async (req, res) => {
        try {
            const {facultyId, studentId, tips, label} = req.body;
            const faculty = await Faculty.findOne({_id: facultyId});
            const student = await Student.findOne({_id: studentId});
            const stripedTips = tips.replace( /(<([^>]+)>)/ig, '');
            const newMapres = {
                facultyId: faculty._id,
                studentId: student._id,
                tips: stripedTips,
                label,
            }
            const mapres = await Mapres.create(newMapres);
            faculty.mapresId.push({_id: mapres._id});
            await faculty.save();
            req.flash('alertMessage', 'Success Add New Mapres');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/mapres');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/mapres');
        }
    },
    
    deleteMapres: async (req, res) => {
        try {
            const {id} = req.params;
            const mapres = await Mapres.findOne({_id: id});
            const faculty = await Faculty.findOne({_id: mapres.facultyId}).populate('mapresId');
            for(let i = 0; i < faculty.mapresId.length; i++) {
                if(faculty.mapresId[i]._id.toString() === mapres._id.toString()) {
                    faculty.mapresId.pull({ _id: mapres._id });
                    await faculty.save();
                }
            }
            await mapres.remove();
            req.flash('alertMessage', 'Success Delete Mapres');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/mapres');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/mapres');
        }
    },
    
    showEditMapres: async(req, res) => {
        try {
            const { id } = req.params;
            const mapres = await Mapres.findOne({_id: id}).populate({path: 'facultyId', select: 'id faculty'}).populate({path: 'studentId', select: 'id name'});
            const faculty = await Faculty.find();
            const student = await Student.find().populate({path: 'majorId', select: 'id name'});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/mapres/view_mapres', {
                title: 'Mapres UG | Edit Mapres',
                faculty,
                student,
                alert,
                mapres,
                action: 'edit',
                user: req.session.user,
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/mapres')    
        }
    },
    
    editMapres: async (req, res) => {
        try {
            const {id} = req.params;
            const { facultyId, studentId, tips, label } = req.body;
            const mapres = await Mapres.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id faculty'})
            .populate({path: 'studentId', select: 'id name'});
            mapres.tips = tips;
            mapres.label = label;
            mapres.facultyId = facultyId;
            mapres.studentId = studentId;
            await mapres.save();
            req.flash('alertMessage', 'Success Update Mapres');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/mapres');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/mapres')
        }
    },
    
    // Students
    viewStudents: async (req, res) => {
        try {
            const students = await Student.find()
            .populate({path: 'facultyId', select: 'id faculty'})
            .populate({path: 'majorId', select: 'id name'});
            const faculty = await Faculty.find();
            const major = await Major.find().populate({path: 'facultyId', select: 'id name'});
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/students/view_students', {
                title: "Mapres UG | Students",
                faculty,
                major,
                alert,
                students,
                action: 'view',
                user: req.session.user,
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/students');   
        }
    },
    
    addStudents: async (req, res) => {
        try {
            if(!req.file) {
                req.flash('alertMessage', 'Image not found');
                req.flash('alertStatus', 'danger');
                res.redirect(`/admin/students`);
            }
            const {facultyId, majorId, name, npm, email, noTelp, yearStart} = req.body;
            const faculty = await Faculty.findOne({_id: facultyId});
            const major = await Major.findOne({_id: majorId});
            const newStudents = {
                facultyId: faculty._id,
                majorId: major._id,
                name,
                npm,
                email,
                noTelp,
                yearStart,
                image: `images/${req.file.filename}`
            }
            const students = await Student.create(newStudents);
            faculty.studentId.push({_id: students._id});
            major.studentId.push({_id: students._id});
            await faculty.save();
            await major.save();
            req.flash('alertMessage', 'Success Add New News');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/students');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/students')    
        }
    },
    
    showEditStudents: async(req, res) => {
        try {
            const { id } = req.params;
            const students = await Student.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id faculty'})
            .populate({path: 'majorId', select: 'id name'});
            const faculty = await Faculty.find();
            const major = await Major.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/students/view_students', {
                title: 'Mapres UG | Edit Students',
                faculty,
                major,
                alert,
                students,
                user: req.session.user,
                action: 'edit',
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/students')    
        }
    },
    
    editStudents: async (req, res) => {
        try {
            const {id} = req.params;
            const {facultyId, majorId, name, npm, email, noTelp, yearStart} = req.body;
            const students = await Student.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id faculty'})
            .populate({path: 'majorId', select: 'id name'});
            
            if(req.file === undefined) {
                students.name = name;
                students.npm = npm;
                students.email = email;
                students.noTelp = noTelp;
                students.yearStart = yearStart;
                students.facultyId = facultyId;
                students.majorId = majorId;
                await students.save();
                req.flash('alertMessage', 'Success Update New students');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/students');
            } else {
                await fs.unlink(path.join(`public/${students.image}`));
                students.name = name;
                students.npm = npm;
                students.email = email;
                students.noTelp = noTelp;
                students.yearStart = yearStart;
                students.facultyId = facultyId;
                students.majorId = majorId;
                students.image = `images/${req.file.filename}`;
                await students.save();
                req.flash('alertMessage', 'Success Update students');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/students');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/students')
        }
    },
    
    deleteStudents: async (req, res) => {
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
            res.redirect('/admin/students');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/students');
        }
    },
    
    // Achievements
    viewAchievements: async (req, res) => {
        try {
            const prestasi = await Prestasi.find()
            .populate({path: 'studentId', select: 'id name npm'})
            const student = await Student.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/achievements/view_achievements', {
                title: "Mapres UG | Achievements",
                student,
                alert,
                prestasi,
                user: req.session.user,
                action: 'view'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/achievements');   
        }
    },
    
    getStudents: async (req, res) => {
        let payload = req.body.payload.trim();
        let search = await Student.find({name: {$regex: new RegExp('^'+payload+'.*','i')}}).exec();
        search = search.slice(0, 10);
        res.send({payload: search});
    },
    
    addAchievements: async (req, res) => {
        try {
            if(!req.file) {
                req.flash('alertMessage', 'Docs not found');
                req.flash('alertStatus', 'danger');
                res.redirect(`/admin/achievements`);
            }
            const { studentId, event, kepesertaan, category, teamName, creation, countryQty, uniQty, peringkat, startDate, endDate, newsURL } = req.body;
            const student = await Student.findOne({_id: studentId});
            const newAchievements = {
                studentId: student._id,
                event,
                kepesertaan,
                category, 
                teamName, 
                creation, 
                countryQty, 
                uniQty, 
                peringkat, 
                startDate, 
                endDate, 
                newsURL,
                document: `images/${req.file.filename}`
            }
            const achievements = await Prestasi.create(newAchievements);
            student.prestasiId.push({_id: achievements._id});
            await student.save();
            req.flash('alertMessage', 'Success Add New Prestasi');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/achievements');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/achievements')    
        }
    },
    
    // Faculty
    viewFaculty: async (req, res) => {
        try {
            const faculty = await Faculty.find().populate({ path: 'imageId', select: 'id image' });
            console.log(faculty);
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus}; 
            res.render('admin/faculty/view_faculty', {
                title: "Mapres UG | Faculty",
                alert,
                faculty,
                user: req.session.user,
                action: 'view faculty',
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/faculty');
        }
    },
    
    addFaculty: async (req, res) => {
        try {
            const {faculty, stands, about} = req.body;
            if(req.files.length > 0) {
                const newFaculty = {
                    faculty,
                    stands,
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
                title: 'Mapres UG | Edit faculty',
                alert,
                faculty,
                user: req.session.user,
                action: 'edit faculty',
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
            const { faculty, stands, about } = req.body;
            const faculties = await Faculty.findOne({_id: id})
            .populate({path: 'imageId', select: 'id image'});
            
            if(req.files.length > 0) {
                for(let i = 0; i < faculties.imageId.length; i++) {
                    const imageUpdate = await Image.findOne({_id: faculties.imageId[i]._id});
                    await fs.unlink(path.join(`public/${imageUpdate.image}`));
                    imageUpdate.image = `images/${req.files[i].filename}`;
                    await imageUpdate.save();  
                }
                faculties.faculty = faculty;
                faculties.stands = stands;
                faculties.about = about;
                await faculties.save();
                req.flash('alertMessage', 'Success Update Faculty');
                req.flash('alertStatus', 'success'); 
                res.redirect('/admin/faculty');
            } else {
                faculties.faculty = faculty;
                faculties.stands = stands;
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
            const major = await Major.find().populate({path: 'facultyId', select: 'id faculty'});
            const faculty = await Faculty.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/major/view_major', {
                title: "Mapres UG | major",
                faculty,
                alert,
                major,
                user: req.session.user,
                action: 'view major'
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
            const major = await Major.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id faculty'});
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
                action: 'edit major',
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/major')    
        }
    },
    
    editMajor: async (req, res) => {
        try {
            const {id} = req.params;
            const { facultyId, name, code } = req.body;
            const major = await Major.findOne({_id: id}).populate({path: 'facultyId', select: 'id faculty'});
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
    
    viewFachieve: async (req, res) => {
        try {
            const fachieve = await Achieve.find().populate({path: 'facultyId', select: 'id faculty'});
            const faculty = await Faculty.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/fachieve/view_fachieve', {
                title: "Mapres UG | Info Achievements",
                faculty,
                alert,
                fachieve,
                user: req.session.user,
                action: 'view'
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/fachieve');   
        }
    },
    
    addFachieve: async (req, res) => {
        try {
            const {facultyId, studQty, medalsQty, patenQty} = req.body;
            const faculty = await Faculty.findOne({_id: facultyId});
            const newFachieve = {
                facultyId: faculty._id,
                studQty,
                medalsQty,
                patenQty
            }
            const achieve = await Achieve.create(newFachieve);
            faculty.achieveId.push({_id: achieve._id});
            await faculty.save();
            req.flash('alertMessage', 'Success Add New Info Achieve');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/fachieve');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/fachieve');
        }
    },
    
    showEditFachieve: async(req, res) => {
        try {
            const { id } = req.params;
            const fachieve = await Achieve.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id faculty'});
            const faculty = await Faculty.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/fachieve/view_fachieve', {
                title: 'Mapres UG | Edit Info Achievements',
                faculty,
                alert,
                fachieve,
                user: req.session.user,
                action: 'edit',
            })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/fachieve')    
        }
    },
    
    editFachieve: async (req, res) => {
        try {
            const {id} = req.params;
            const { facultyId, studQty, medalsQty, patenQty } = req.body;
            const fachieve = await Achieve.findOne({_id: id})
            .populate({path: 'facultyId', select: 'id name'});
            fachieve.studQty = studQty;
            fachieve.medalsQty = medalsQty;
            fachieve.patenQty = patenQty;
            fachieve.facultyId = facultyId;
            await fachieve.save();
            req.flash('alertMessage', 'Success Update New fachieve');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/fachieve');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/fachieve')
        }
    },
    
    deleteFachieve: async (req, res) => {
        try {
            const {id} = req.params;
            const fachieve = await Achieve.findOne({_id: id});
            const faculty = await Faculty.findOne({ _id: fachieve.facultyId }).populate('achieveId');
            for(let i = 0; i < faculty.achieveId.length; i++) {
                if(faculty.achieveId[i]._id.toString() === fachieve._id.toString()) {
                    faculty.achieveId.pull({ _id: fachieve._id });
                    await faculty.save();
                }
            }
            await fachieve.remove();
            req.flash('alertMessage', 'Success Delete Info Achievements');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/fachieve');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/fachieve');
        }
    },
    
    // News
    viewNews: async (req, res) => {
        try {
            const news = await News.find().populate({path: 'scoopId', select: 'id name'});
            const scoop = await Scoop.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/news/view_news', {
                title: "Mapres UG | News",
                scoop,
                alert,
                news,
                user: req.session.user,
                action: 'view'
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
            const {scoopId, headline, about} = req.body;
            const scoop = await Scoop.findOne({_id: scoopId});
            const newNews = {
                scoopId: scoop._id,
                headline,
                about,
                image: `images/${req.file.filename}`
            }
            const news = await News.create(newNews);
            scoop.newsId.push({_id: news._id});
            await scoop.save();
            req.flash('alertMessage', 'Success Add New News');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/news');
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/news');
        }
    },
    
    showDetailNews: async (req, res) => {
        try {
            const { id } = req.params;
            const news = await News.findOne({_id: id});
            console.log(news);
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/news/view_news', {
                title: "Mapres UG | Show Detail News",
                alert,
                news,
                user: req.session.user,
                action: 'show detail'
            })
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
            const scoop = await Scoop.findOne({ _id: news.scoopId }).populate('newsId');
            for(let i = 0; i < scoop.newsId.length; i++) {
                if(scoop.newsId[i]._id.toString() === news._id.toString()) {
                    scoop.newsId.pull({ _id: news._id });
                    await scoop.save();
                }
            }
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
    
    showEditNews: async(req, res) => {
        try {
            const { id } = req.params;
            const news = await News.findOne({_id: id})
            .populate({path: 'scoopId', select: 'id name'});
            const scoop = await Scoop.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/news/view_news', {
                title: 'Mapres UG | Edit News',
                scoop,
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
            const {id} = req.params;
            const { scoopId, headline, about } = req.body;
            const news = await News.findOne({_id: id})
            .populate({path: 'scoopId', select: 'id name'});
            
            if(req.file === undefined) {
                news.headline = headline;
                news.about = about;
                news.scoopId = scoopId;
                await news.save();
                req.flash('alertMessage', 'Success Update New News');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/news');
            } else {
                await fs.unlink(path.join(`public/${news.image}`));
                news.headline = headline;
                news.about = about;
                news.scoopId = scoopId;
                news.image = `images/${req.file.filename}`;
                await news.save();
                req.flash('alertMessage', 'Success Update News');
                req.flash('alertStatus', 'success');
                res.redirect('/admin/news');
            }
        } catch (error) {
            req.flash('alertMessage', `${error.message}`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/news')
        }
    },
    
    // Scoop
    viewScoop: async (req, res) => {
        try {
            const scoop = await Scoop.find();
            console.log(scoop);
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = {message: alertMessage, status: alertStatus};
            res.render('admin/scoop/view_scoop', {
                scoop, 
                alert,
                user: req.session.user,
                title: "Mapres UG | Scoop"
            });
        } catch (error) {
            res.redirect('/admin/scoop');
        }
    },
    addScoop: async (req, res) => {
        try {
            const { name } = req.body;
            await Scoop.create({ name });
            req.flash('alertMessage', 'Success Add New Scoop');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/scoop');
        } catch (error) {
            res.redirect('/admin/scoop');
            req.flash('alertMessage', `$error.message`);
            req.flash('alertStatus', 'danger');
        }
    },
    editScoop: async (req, res) => {
        try {
            const { id, name } = req.body;
            const scoop = await Scoop.findOne({_id: id})
            scoop.name = name;
            await scoop.save();
            req.flash('alertMessage', 'Success Update Scoop');
            req.flash('alertStatus', 'success');
            res.redirect('/admin/scoop');
        } catch (error) {
            req.flash('alertMessage', `$error.message`);
            req.flash('alertStatus', 'danger');
            res.redirect('/admin/scoop');
        }
    },
    deleteScoop: async (req, res) => {
        const { id } = req.params;
        const scoop = await Scoop.findOne({_id: id});
        await scoop.remove();
        res.redirect('/admin/scoop');
    }
}