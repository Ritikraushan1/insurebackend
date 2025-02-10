const express = require('express')
const { createAssignment,
    fetchAllAssignments,
    fetchAssignmentById,
    fetchAssignmentsByUser,
    fetchAssignmentsByPolicy,
    modifyAssignmentById,
    removeAssignmentById } = require('../controllers/assignController')
const { authenticateUser, authenticateAdmin } = require('../middleware/userValidate')

const router = express.Router()

router.post('/', authenticateUser, createAssignment)
router.get('/for-users', authenticateUser, fetchAssignmentsByUser)
router.get('/', authenticateAdmin, fetchAllAssignments)
router.get('/:id', authenticateAdmin, fetchAssignmentById)
router.get('/for-policy/:policyId',authenticateAdmin, fetchAssignmentsByPolicy)
router.put('/:id', authenticateAdmin, modifyAssignmentById)
router.delete('/:id', authenticateAdmin, removeAssignmentById)


module.exports = router