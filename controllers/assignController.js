const { getAllAssignments, checkAssignmentExists, getAssignmentById, getAssignmentsByPolicyId, getAssignmentsByUserId, addAssignment, updateAssignmentById, deleteAssignmentById } = require('../models/assignModel');
const { getPolicyById } = require('../models/policyModel');
const { getUsersWithId } = require('../models/userModel');

const createAssignment = async (req, res) => {
    const user = req.user;
    console.log("user in add policy", user);
    const { userId, policyId } = req.body;
    try {
        const users = await getUsersWithId(userId);
        if (!users) {
            return res.status(500).send({ error: `No users found with user id: ${userId}` });
        }
        const policy = await getPolicyById(policyId);
        if (!policy) {
            return res.status(500).send({ error: `no policy found for policy id: ${policyId}` });
        }
        const alreadyAssigned = await checkAssignmentExists(userId, policyId)
        if (alreadyAssigned) {
            return res.status(500).send({ error: `User has already subscribed to the same policy` });
        }
        const result = await addAssignment(userId, policyId);
        return res.status(201).send({ message: 'Assignment created successfully' });
    } catch (error) {
        return res.status(500).send({ error: `Failed to create assignment: ${error.message}` });
    }
};

const fetchAllAssignments = async (req, res) => {
    try {
        const assignments = await getAllAssignments();
        return res.status(200).send(assignments);
    } catch (error) {
        return res.status(500).send({ error: `Failed to fetch assignments: ${error.message}` });
    }
};

const fetchAssignmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await getAssignmentById(id);
        if (assignment.length === 0) {
            return res.status(404).send({ message: 'Assignment not found' });
        } else {
            return res.status(200).send(assignment);
        }
    } catch (error) {
        return res.status(500).send({ error: `Failed to fetch assignment: ${error.message}` });
    }
};

const fetchAssignmentsByUser = async (req, res) => {
    const user = req.user;
    console.log("User reaching here:", user);

    const userId = user.id;
    console.log("User ID:", userId);

    try {
        // Fetch assignments by user
        const assignments = await getAssignmentsByUserId(userId);
        
        // Map through each assignment to get policy details and calculate remaining days and next premium date
        const assignmentsWithPolicyDetails = await Promise.all(assignments.map(async (assignment) => {
            const policy = await getPolicyById(assignment.policyId);
            
            if (policy) {
                // Validate the assigned date
                let assignedDate = new Date(assignment.date);
                if (isNaN(assignedDate)) {
                    console.log("Invalid assigned date:", assignment.date);
                    assignedDate = new Date();  // Fallback to current date if invalid
                }

                // Calculate remaining time in days
                const duration = policy.duration; // Assuming duration is in months
                
                // Calculate remaining days (using duration in months)
                const endDate = new Date(assignedDate);
                endDate.setMonth(assignedDate.getMonth() + duration);
                const remainingDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)); // Remaining days

                // Calculate next premium due date (next month of assigned date)
                const nextPremiumDue = new Date(assignedDate);
                nextPremiumDue.setMonth(assignedDate.getMonth() + 1); // Next month

                // Return enhanced assignment data with policy details
                return {
                    orderId: assignment.id,
                    policyDetails: policy,
                    userId: assignment.userId,
                    assignedDate: assignedDate.toISOString(),
                    remainingTime: remainingDays,  // Remaining days
                    nextPremiumDue: nextPremiumDue.toISOString(),
                };
            } else {
                // If no policy found, just return the assignment
                return {
                    orderId: assignment.id,
                    policyDetails: {},
                    userId: assignment.userId,
                    assignedDate: assignment.assignedDate,
                    remainingTime: null,
                    nextPremiumDue: null,
                };
            }
        }));

        // Return the assignments with enhanced policy details
        return res.status(200).send(assignmentsWithPolicyDetails);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return res.status(500).send({ error: `Failed to fetch assignments: ${error.message}` });
    }
};


const fetchAssignmentsByPolicy = async (req, res) => {
    const { policyId } = req.params;
    try {
        const assignments = await getAssignmentsByPolicyId(policyId);
        return res.status(200).send(assignments);
    } catch (error) {
        return res.status(500).send({ error: `Failed to fetch assignments: ${error.message}` });
    }
};

const modifyAssignmentById = async (req, res) => {
    const { id } = req.params;
    const { userId, policyId } = req.body;
    try {
        await updateAssignmentById(id, userId, policyId);
        return res.status(200).send({ message: 'Assignment updated successfully' });
    } catch (error) {
        return res.status(500).send({ error: `Failed to update assignment: ${error.message}` });
    }
};

const removeAssignmentById = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    console.log("user in add policy", user);
    if (user.role !== "admin") {
        return res.status(401).json({ message: "You are not authorized to add new policy" })
    }
    try {
        await deleteAssignmentById(id);
        return res.status(200).send({ message: 'Assignment deleted successfully' });
    } catch (error) {
        return res.status(500).send({ error: `Failed to delete assignment: ${error.message}` });
    }
};

module.exports = {
    createAssignment,
    fetchAllAssignments,
    fetchAssignmentById,
    fetchAssignmentsByUser,
    fetchAssignmentsByPolicy,
    modifyAssignmentById,
    removeAssignmentById
};
