const { getPolicyById, getAllPolicies, getActivePolicies, insertNewPolicy, updatePolicyWithId, deletePolicyWithId, updatePolicyIsActive, getPoliciesByCategory } = require('../models/policyModel.js');

async function addNewPolicyController(req, res) {
    try {
        const user = req.user;
        console.log("User in add policy:", user);
        if (user.role !== "admin") {
            return res.status(401).json({ message: "You are not authorized to add a new policy" });
        }
        
        const policy = req.body;
        const newPolicy = await insertNewPolicy(policy);

        return res.status(201).json({
            message: "Policy added successfully",
            policy: newPolicy,
        });
    } catch (error) {
        console.error("Error in adding policy:", error);
        return res.status(500).json({
            message: "Error in adding policy",
            error: error.message,
        });
    }
}

async function getActivePoliciesController(req, res) {
    try {
        const policies = await getActivePolicies(); // Assuming the model function is correctly implemented
        console.log("policies",policies);
        
        if (policies.length > 0) {
            res.status(200).json({ message: "Active policies found", policies });
        } else {
            res.status(404).json({ message: "No active policies found" });
        }
    } catch (error) {
        console.error("Error in fetching active policies:", error);
        res.status(500).json({ message: "Error in fetching active policies", error: error.message });
    }
}


async function getPolicyController(req, res) {
    try {
        const { id: policyId } = req.params;
        const policy = await getPolicyById(policyId);

        if (policy) {
            res.status(200).json({ message: "Policy found", policy });
        } else {
            res.status(404).json({ message: "Policy not found" });
        }
    } catch (error) {
        console.error("Error in fetching policy:", error);
        res.status(500).json({ message: "Error in fetching policy", error: error.message });
    }
}

async function getAllPolicyController(req, res) {
    try {
        const policies = await getAllPolicies();
        if (policies.length > 0) {
            res.status(200).json({ message: "Policies found", policies });
        } else {
            res.status(404).json({ message: "No policies found" });
        }
    } catch (error) {
        console.error("Error in fetching policies:", error);
        res.status(500).json({ message: "Error in fetching policies", error: error.message });
    }
}

async function getPoliciesByCategoryController(req, res) {
    try {
        const { category } = req.params;
        const policies = await getPoliciesByCategory(category);
        if (policies.length > 0) {
            res.status(200).json({ message: "Policies found for category", policies });
        } else {
            res.status(404).json({ message: "No policies found for this category" });
        }
    } catch (error) {
        console.error("Error in fetching policies by category:", error);
        res.status(500).json({ message: "Error in fetching policies by category", error: error.message });
    }
}

async function updatePolicyStatusController(req, res) {
    try {
        const user = req.user;
        if (user.role !== "admin") {
            return res.status(401).json({ message: "You are not authorized to update policy status" });
        }
        
        const { id: policyId } = req.params;
        const { isActive } = req.body;
        const updatedPolicy = await updatePolicyIsActive(policyId, isActive);

        if (updatedPolicy) {
            res.status(200).json({ message: "Policy status updated successfully", policy: updatedPolicy });
        } else {
            res.status(404).json({ message: "Policy not found" });
        }
    } catch (error) {
        console.error("Error in updating policy status:", error);
        res.status(500).json({ message: "Error in updating policy status", error: error.message });
    }
}

async function updatePolicyController(req, res) {
    try {
        const user = req.user;
        console.log("User in update policy:", user);
        if (user.role !== "admin") {
            return res.status(401).json({ message: "You are not authorized to update a policy" });
        }
        
        const { id: policyId } = req.params;
        console.log(policyId,"policy id");
        
        const policyData = req.body;
        const updatedPolicy = await updatePolicyWithId(policyId, policyData);

        if (updatedPolicy) {
            res.status(200).json({ message: "Policy updated successfully", policy: updatedPolicy });
        } else {
            res.status(404).json({ message: "Policy not found" });
        }
    } catch (error) {
        console.error("Error in updating policy:", error);
        res.status(500).json({ message: "Error in updating policy", error: error.message });
    }
}

async function deletePolicyController(req, res) {
    try {
        const user = req.user;
        console.log("User in delete policy:", user);
        if (user.role !== "admin") {
            return res.status(401).json({ message: "You are not authorized to delete a policy" });
        }
        
        const { id: policyId } = req.params;
        const result = await deletePolicyWithId(policyId);

        if (result) {
            res.status(200).json({ message: "Policy deleted successfully", result });
        } else {
            res.status(404).json({ message: "Policy not found" });
        }
    } catch (error) {
        console.error("Error in deleting policy:", error);
        res.status(500).json({ message: "Error in deleting policy", error: error.message });
    }
}

module.exports = {addNewPolicyController, getActivePoliciesController, getAllPolicyController, getPoliciesByCategoryController, getPolicyController, updatePolicyController, updatePolicyStatusController, deletePolicyController };