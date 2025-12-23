require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Milestone = require('../models/Milestone');
const Invitation = require('../models/Invitation');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const brevoEmailService = require('../services/brevoEmailService');
const crypto = require('crypto');

const jwtSecret = process.env.JWT_SECRET;

// Add this at the top of your routes
if (!jwtSecret) {
    console.error('❌ JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

// Update auth.js registration with better normalization
const normalizeGroupName = (name) => {
    return name
        .trim()                    // Remove spaces
        .toLowerCase()             // Convert to lowercase
        .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
        .replace(/[^\w\s]/g, ''); // Remove special characters except spaces
};

// Register route
router.post('/register', async (req, res) => {
    const { full_name, phone, email, password, group_name, invite_code, role } = req.body;
    const useRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    if (!full_name || !phone || !email || !password || !group_name) {
        return res.status(400).json({ error: 'All fields are required (full_name, phone, email, password, group_name)' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const normalizedGroupName = group_name.trim().toLowerCase();

        // Check if member already exists by phone or email
        const existingMember = await Member.findOne({ 
            $or: [{ phone }, { email }] 
        });
        
        if (existingMember) {
            if (existingMember.phone === phone) {
                return res.status(400).json({ error: 'Phone number already registered' });
            }
            if (existingMember.email === email) {
                return res.status(400).json({ error: 'Email already registered' });
            }
        }

        // Find or create group
        let group = await Group.findOne({ group_name: normalizedGroupName });
        
        if (!group) {
            if (useRole !== 'admin') {
                return res.status(400).json({ error: 'Group does not exist. Only admins can create groups.' });
            }
            
            // Admin creates new group
            group = new Group({ 
                group_name: normalizedGroupName,
                interest_rate: 5.0,
                minimum_loan_savings: 500.00
            });
            await group.save();
        }

        // Determine status based on role and invite
        let status = 'pending'; // Default: needs approval
        
        if (useRole === 'admin') {
            status = 'approved'; // Admins auto-approved
        } else if (invite_code) {
            // Check if valid invitation exists
            const invitation = await Invitation.findOne({ 
                group_id: group._id, 
                email: email.toLowerCase(),
                invite_code: invite_code.toUpperCase(),
                status: 'pending',
                expires_at: { $gt: new Date() }
            }).populate('invited_by');
            
            if (invitation) {
                // Auto-approve if invited by admin, otherwise pending
                const inviter = invitation.invited_by;
                if (inviter && inviter.is_admin) {
                    status = 'approved'; // Admin invitations auto-approved
                } else {
                    status = 'pending'; // Member invitations need admin approval
                }
                invitation.status = 'accepted';
                await invitation.save();
            }
        }

        // Generate email verification code (6 digits)
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create member
        const hashedPassword = await bcrypt.hash(password, 10);
        const newMember = new Member({
            full_name,
            phone,
            email,
            password: hashedPassword,
            group_id: group._id,
            role: useRole,
            is_admin: useRole === 'admin',
            status: status,
            email_verified: false,
            email_verification_code: verificationCode,
            email_verification_expires: verificationExpires
        });

        await newMember.save();

        // Update group admin if this is admin
        if (useRole === 'admin') {
            await Group.findByIdAndUpdate(group._id, { admin_id: newMember._id });
        }

        // Send verification email
        try {
            await brevoEmailService.sendVerificationEmail(email, full_name, verificationCode);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({ 
            message: 'Registration successful! Please check your email to verify your account.',
            status: status,
            emailSent: true,
            memberId: newMember._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify email with code
router.post('/verify-email', async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ error: 'Email and verification code are required' });
    }

    try {
        const member = await Member.findOne({ email });
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (member.email_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Check if code expired
        if (new Date() > member.email_verification_expires) {
            return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
        }

        // Check if code matches
        if (member.email_verification_code !== verificationCode) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Mark as verified
        member.email_verified = true;
        member.email_verification_code = undefined;
        member.email_verification_expires = undefined;
        await member.save();

        // Send appropriate email based on status
        const group = await Group.findById(member.group_id);
        const groupName = group ? group.group_name : 'your group';
        
        try {
            if (member.status === 'approved') {
                // Send welcome email for approved members
                await brevoEmailService.sendWelcomeEmail(
                    member.email, 
                    member.full_name, 
                    groupName
                );
            } else {
                // Send pending approval email for members awaiting approval
                await brevoEmailService.sendPendingApprovalEmail(
                    member.email,
                    member.full_name,
                    groupName
                );

                // Notify admin about new pending member
                const admin = await Member.findOne({ 
                    group_id: member.group_id, 
                    is_admin: true,
                    email_verified: true 
                });
                
                if (admin && admin.email) {
                    await brevoEmailService.sendAdminApprovalNotification(
                        admin.email,
                        admin.full_name,
                        member.full_name,
                        member.email,
                        groupName
                    );
                }
            }
        } catch (emailError) {
            console.error('Error sending post-verification emails:', emailError);
        }

        res.json({ 
            message: 'Email verified successfully!',
            verified: true,
            status: member.status,
            requiresApproval: member.status === 'pending'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const member = await Member.findOne({ email });
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (member.email_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        member.email_verification_code = verificationCode;
        member.email_verification_expires = verificationExpires;
        await member.save();

        // Send verification email
        await brevoEmailService.sendVerificationEmail(email, member.full_name, verificationCode);

        res.json({ 
            message: 'Verification code sent to your email',
            emailSent: true
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
});

// Login route - accepts both phone and email
router.post('/login', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    try {
        // Check if input is email or phone
        const isEmail = emailOrPhone.includes('@');
        const member = isEmail 
            ? await Member.findOne({ email: emailOrPhone })
            : await Member.findOne({ phone: emailOrPhone });
        
        if (!member) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if member has no email (needs to add email)
        if (!member.email || member.email === '' || member.email === null) {
            return res.status(403).json({ 
                error: 'Please add an email to your account',
                needsEmail: true,
                phone: member.phone
            });
        }

        // Check if email is verified (only for email login)
        if (member.email && !member.email_verified) {
            return res.status(403).json({ 
                error: 'Please verify your email before logging in',
                emailVerified: false,
                email: member.email,
                phone: member.phone
            });
        }

        // Check member status
        if (member.status === 'denied') {
            return res.status(403).json({ 
                error: 'Your membership was denied. Please contact admin or apply to a different group.',
                rejection_reason: member.rejection_reason
            });
        }

        if (member.status === 'pending') {
            return res.status(403).json({ error: 'Your membership is still pending admin approval.' });
        }

        const isValidPassword = await bcrypt.compare(password, member.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token for approved members only
        const token = jwt.sign(
            { id: member._id, phone: member.phone, email: member.email, is_admin: member.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            member: {
                id: member._id,
                full_name: member.full_name,
                phone: member.phone,
                email: member.email,
                role: member.role,
                is_admin: member.is_admin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin login
router.post('/admin/login', async (req, res) => {
    const { phone, password } = req.body;
    
    try {
        const admin = await Member.findOne({ phone, is_admin: true });
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const payload = { id: admin._id, full_name: admin.full_name, is_admin: true, role: admin.role };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        
        return res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                full_name: admin.full_name,
                is_admin: true,
                role: admin.role
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
        const user = await Member.findOne({ email });
        if (!user) {
            // Don't reveal if user exists for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Send password reset email
        try {
            await brevoEmailService.sendPasswordResetEmail(email, user.full_name, resetToken);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            return res.status(500).json({ error: 'Failed to send password reset email' });
        }

        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error in password reset request:', error);
        res.status(500).json({ error: 'Error processing password reset request' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await Member.findOneAndUpdate(
            { email: decoded.email },
            { password: hashedPassword }
        );
        
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Invalid or expired token' });
    }
});

// Update member profile
router.put('/update-profile', authenticateToken, async (req, res) => {
    const memberId = req.user.id;
    const { full_name, phone } = req.body;
    
    try {
        await Member.findByIdAndUpdate(memberId, { full_name, phone });
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile.' });
    }
});

// Update milestone
router.put('/milestone/:id', authenticateToken, async (req, res) => {
    const memberId = req.user.id;
    const milestoneId = req.params.id;
    const { milestone_name, target_amount } = req.body;
    
    try {
        await Milestone.findOneAndUpdate(
            { _id: milestoneId, member_id: memberId },
            { milestone_name, target_amount }
        );
        res.json({ message: 'Milestone updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating milestone.' });
    }
});

// Approve member
router.post('/approve-member', authenticateToken, async (req, res) => {
    const { member_id } = req.body;
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    try {
        await Member.findByIdAndUpdate(member_id, { status: 'approved' });
        res.json({ message: 'Member approved.' });
    } catch (error) {
        res.status(500).json({ error: 'Error approving member.' });
    }
});

// Deny member
router.post('/deny-member', authenticateToken, async (req, res) => {
    const { member_id } = req.body;
    
    try {
        await Member.findByIdAndDelete(member_id);
        res.json({ message: 'Member denied and removed.' });
    } catch (error) {
        res.status(500).json({ error: 'Error denying member.' });
    }
});

// Get SMS preferences
router.get('/members/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        res.json({ 
            smsPreferences: member.sms_preferences || {
                contribution_reminders: true,
                loan_updates: true,
                repayment_reminders: true,
                group_updates: true,
                account_updates: true
            }
        });
    } catch (error) {
        console.error('Error fetching SMS preferences:', error);
        res.status(500).json({ error: 'Failed to fetch SMS preferences' });
    }
});

// Update SMS preferences
router.put('/members/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const { smsPreferences } = req.body;
        
        if (!smsPreferences || typeof smsPreferences !== 'object') {
            return res.status(400).json({ error: 'Invalid SMS preferences data' });
        }
        
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Update SMS preferences
        member.sms_preferences = {
            ...member.sms_preferences,
            ...smsPreferences,
            account_updates: true // Always keep account updates enabled for security
        };
        
        await member.save();
        
        res.json({ 
            message: 'SMS preferences updated successfully',
            smsPreferences: member.sms_preferences
        });
    } catch (error) {
        console.error('Error updating SMS preferences:', error);
        res.status(500).json({ error: 'Failed to update SMS preferences' });
    }
});

// Add/Update email for existing users (for users who registered without email)
router.post('/add-email', async (req, res) => {
    const { phone, email } = req.body;

    if (!phone || !email) {
        return res.status(400).json({ error: 'Phone number and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Find member by phone
        const member = await Member.findOne({ phone });
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found with this phone number' });
        }

        // Check if email is already used by another member
        const emailExists = await Member.findOne({ 
            email: email.toLowerCase(),
            _id: { $ne: member._id } 
        });
        
        if (emailExists) {
            return res.status(400).json({ error: 'This email is already registered to another account' });
        }

        // Generate email verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update member with email and verification code
        member.email = email.toLowerCase();
        member.email_verified = false;
        member.email_verification_code = verificationCode;
        member.email_verification_expires = verificationExpires;
        await member.save();

        // Send verification email
        try {
            await brevoEmailService.sendVerificationEmail(email, member.full_name, verificationCode);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            return res.status(500).json({ 
                error: 'Failed to send verification email. Please try again.',
                emailAdded: true // Email was added to account but sending failed
            });
        }

        res.json({ 
            message: 'Email added successfully! Please check your email for the verification code.',
            emailSent: true,
            email: email.toLowerCase()
        });

    } catch (error) {
        console.error('Add email error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify email after adding it
router.post('/verify-added-email', async (req, res) => {
    const { phone, email, verificationCode } = req.body;

    if (!phone || !email || !verificationCode) {
        return res.status(400).json({ error: 'Phone, email, and verification code are required' });
    }

    try {
        // Find member by phone and email
        const member = await Member.findOne({ 
            phone,
            email: email.toLowerCase()
        });
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found or email does not match' });
        }

        if (member.email_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Check if code expired
        if (new Date() > member.email_verification_expires) {
            return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
        }

        // Check if code matches
        if (member.email_verification_code !== verificationCode) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Mark as verified
        member.email_verified = true;
        member.email_verification_code = undefined;
        member.email_verification_expires = undefined;
        await member.save();

        res.json({ 
            message: 'Email verified successfully! You can now log in with your email.',
            emailVerified: true
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete member
router.delete('/delete-member/:id', authenticateToken, async (req, res) => {
    const memberId = req.params.id;
    
    if (req.user.id == memberId) {
        return res.status(400).json({ error: "You cannot delete your own admin account." });
    }
    
    try {
        await Member.findByIdAndDelete(memberId);
        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting member.' });
    }
});

module.exports = router;