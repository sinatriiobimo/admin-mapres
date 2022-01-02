const router = require('express').Router();
const apiController = require('../controllers/apiController');

router.get('/landing-page', apiController.landingPage);
router.get('/detail-faculty/:id', apiController.detailFaculty);
router.get('/faculty-table/:id', apiController.allTable);
router.get('/academic/:id', apiController.academicTable);
router.get('/non-academic/:id', apiController.nonAcademicTable);
router.get('/major/:id', apiController.majorTable);
router.get('/news', apiController.newsPage);
router.get('/detail-news/:id', apiController.detailNews);

module.exports = router;