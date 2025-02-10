const express = require('express')
const { createClaim,
    modifyClaim,
    removeClaim,
    getClaim,
    fetchAllClaims,
    fetchClaimsByUser,
    updateClaimStatus } = require('../controllers/claimController')
const { authenticateAdmin, authenticateUser } = require('../middleware/userValidate')

const router = express.Router()

router.post('/', authenticateUser, createClaim)
router.put('/:id', authenticateAdmin, modifyClaim)
router.delete('/:id', authenticateAdmin, removeClaim)
router.get('/users', authenticateUser, fetchClaimsByUser)
router.get('/:id', authenticateAdmin, getClaim)
router.get('/', authenticateAdmin, fetchAllClaims)
router.patch('/:id', authenticateAdmin, updateClaimStatus)

module.exports = router