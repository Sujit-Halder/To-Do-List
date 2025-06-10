const express = require('express');
const router = express.Router();
const { updateImage,deleteImage,addTaskList, editTaskList, deleteTaskList ,createTask,editTask,deleteTask,markTaskAsComplete,} = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');


router.post('/update-image',verifyToken,updateImage);
router.post('/delete-image',verifyToken,deleteImage);

router.post('/tasklists', verifyToken, addTaskList); 
router.put('/tasklists', verifyToken, editTaskList); 
router.delete('/tasklists', verifyToken, deleteTaskList); 

router.post('/task', verifyToken, createTask); 
router.put('/task', verifyToken, editTask); 
router.delete('/task', verifyToken, deleteTask); 
router.patch('/task/complete', verifyToken, markTaskAsComplete); 

module.exports = router;