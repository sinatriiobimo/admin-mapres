const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { uploadMultiple, uploadSingle, uploadDocument } = require('../middlewares/multer');  
const auth = require('../middlewares/auth');

router.get('/signin', adminController.viewSignin);
router.post('/signin', adminController.actionSignin);
router.use(auth);
router.get('/logout', adminController.actionLogout);

router.get('/dashboard', adminController.viewDashboard);

router.get('/achievement', adminController.viewAchievement);
router.post('/achievement', uploadDocument, adminController.addAchievement);
router.get('/achievement/:id', adminController.showEditAchievement);
router.put('/achievement/:id', uploadDocument, adminController.editAchievement);
router.delete('/achievement/:id/delete', adminController.deleteAchievement);

router.get('/student', adminController.viewStudent);
router.post('/student', uploadSingle, adminController.addStudent);
router.get('/student/:id', adminController.showEditStudent);
router.put('/student/:id', uploadSingle, adminController.editStudent);
router.delete('/student/:id/delete', adminController.deleteStudent);

router.get('/faculty', adminController.viewFaculty);
router.post('/faculty', uploadMultiple, adminController.addFaculty);
router.get('/faculty/:id', adminController.showEditFaculty);
router.put('/faculty/:id', uploadMultiple, adminController.editFaculty);
router.delete('/faculty/:id/delete', adminController.deleteFaculty);

router.get('/major', adminController.viewMajor);
router.post('/major', adminController.addMajor);
router.get('/major/:id', adminController.showEditMajor);
router.put('/major/:id', adminController.editMajor);
router.delete('/major/:id/delete', adminController.deleteMajor);

router.get('/news', adminController.viewNews);
router.post('/news', uploadSingle, adminController.addNews);
router.put('/news/:id', uploadSingle, adminController.editNews);
router.get('/news/:id', adminController.showEditNews);
router.delete('/news/:id/delete', adminController.deleteNews);

router.get('/distinguish', adminController.viewDistinguish);
router.post('/distinguish', adminController.addDistinguish);
router.get('/distinguish/:id', adminController.showEditDistinguish);
router.put('/distinguish/:id', adminController.editDistinguish);
router.delete('/distinguish/:id/delete', adminController.deleteDistinguish);

router.get('/team', adminController.viewTeam);
router.post('/team', adminController.addTeam);
router.put('/team', adminController.editTeam);
router.delete('/team/:id', adminController.deleteTeam);

module.exports = router;