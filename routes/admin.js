const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { uploadMultiple, uploadSingle, uploadDocument } = require('../middlewares/multer');
const auth = require('../middlewares/auth');

router.get('/signin', adminController.viewSignin);
router.post('/signin', adminController.actionSignin);
router.use(auth);
router.get('/logout', adminController.actionLogout);

router.get('/dashboard', adminController.viewDashboard);

// endpoint students
router.get('/students', adminController.viewStudents);
router.post('/students', uploadSingle, adminController.addStudents);
router.get('/students/:id', adminController.showEditStudents);
router.put('/students/:id', uploadSingle, adminController.editStudents);
router.delete('/students/:id/delete', adminController.deleteStudents);

// endpoint achievements
router.get('/achievements', adminController.viewAchievements);
router.post('/achievements', uploadDocument, adminController.addAchievements);
// router.post('/getStudents', adminController.getStudents);
// router.put('/achievements/:id', uploadSingle, adminController.editAchievements);
// router.get('/achievements/:id', adminController.showEditAchievements);
// router.delete('/achievements/:id/delete', adminController.deleteAchievements);

// endpoint faculty
router.get('/faculty', adminController.viewFaculty);
router.post('/faculty', uploadMultiple, adminController.addFaculty);
router.get('/faculty/:id', adminController.showEditFaculty);
router.put('/faculty/:id', uploadMultiple, adminController.editFaculty);
router.delete('/faculty/:id/delete', adminController.deleteFaculty);

// endpoint major
router.get('/major', adminController.viewMajor);
router.post('/major', adminController.addMajor);
router.get('/major/:id', adminController.showEditMajor);
router.put('/major/:id', adminController.editMajor);
router.delete('/major/:id/delete', adminController.deleteMajor);

// endpoint news
router.get('/news', adminController.viewNews);
router.get('/news/show-detail/:id', adminController.showDetailNews);
router.post('/news', uploadSingle, adminController.addNews);
router.put('/news/:id', uploadSingle, adminController.editNews);
router.get('/news/:id', adminController.showEditNews);
router.delete('/news/:id/delete', adminController.deleteNews);

// endpoint fachieve
router.get('/fachieve', adminController.viewFachieve);
router.post('/fachieve', adminController.addFachieve);
router.put('/fachieve/:id', adminController.editFachieve);
router.get('/fachieve/:id', adminController.showEditFachieve);
router.delete('/fachieve/:id/delete', adminController.deleteFachieve);

// endpoint scoop
router.get('/scoop', adminController.viewScoop);
router.post('/scoop', adminController.addScoop);
router.put('/scoop', adminController.editScoop);
router.delete('/scoop/:id', adminController.deleteScoop);

// endpoint mapres
router.get('/mapres', adminController.viewMapres);
router.post('/mapres', adminController.addMapres);
router.put('/mapres/:id', adminController.editMapres);
router.get('/mapres/:id', adminController.showEditMapres);
router.delete('/mapres/:id/delete', adminController.deleteMapres);

module.exports = router;