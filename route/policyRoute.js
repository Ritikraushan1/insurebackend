const express = require('express');

const { authenticateAdmin } = require('../middleware/userValidate');
const { addNewPolicyController, getAllPolicyController, getActivePoliciesController, getPoliciesByCategoryController, getPolicyController, updatePolicyController, updatePolicyStatusController, deletePolicyController } = require('../controllers/policyController');

const router = express.Router();

router.post('/', authenticateAdmin, addNewPolicyController);
router.get('/active', getActivePoliciesController)
router.get('/', authenticateAdmin, getAllPolicyController);
router.get('/category/:category', getPoliciesByCategoryController);
router.get('/:id', getPolicyController);
router.put('/:id', authenticateAdmin, updatePolicyController);
router.patch('/:id/status', authenticateAdmin, updatePolicyStatusController);
router.delete('/:id', authenticateAdmin, deletePolicyController);

module.exports = router;
