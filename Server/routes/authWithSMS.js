const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Group = require('../models/Group');
const smsService = require('../services/smsService');
const { authenticateToken } = require('../middleware/auth');

// Helper function to format Kenyan phone numbers
const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
        cleanPhone = '254' + cleanPhone;
    } else if (!cleanPhone.startsWith('254')) {
        cleanPhone = '254' + cleanPhone;
    }
    
    return cleanPhone;
};

// Step 1: Registration with phone verification
router.post('/register', async (req, res) => {
    const { full_name, phone, password, group_name, group_type = 'savings_and_loans', role } = req.body;
    const useRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    if (!full_name || !phone || !password || !group_name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const normalizedGroupName = group_name.trim().toLowerCase();

        // Check if member already exists
        let existingMember = await Member.findOne({ phone: formattedPhone });
        
        // Find or create group
        let group = await Group.findOne({ group_name: normalizedGroupName });
        
        if (!group && useRole === 'admin') {
            // Admin creates new group
            group = new Group({ 
                group_name: normalizedGroupName,
                group_type: group_type,
                interest_rate: 5.0,
                minimum_loan_savings: 500.00
            });
            await group.save();
        } else if (!group) {
            return res.status(400).json({ error: 'Group does not exist. Contact admin to join.' });
        }

        // Check if member already belongs to this specific group
        if (existingMember) {
            const existingMembership = existingMember.group_memberships?.find(
                membership => membership.group_id.toString() === group._id.toString()
            );
            if (existingMembership) {
                return res.status(400).json({ error: 'Phone number already registered in this group' });
            }
        }

        // Check if SMS is disabled (testing mode)
        const SMS_ENABLED = false; // Set to true to enable SMS
        
        // Generate verification OTP
        const verificationOTP = smsService.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let newMember;
        
        if (existingMember) {
            // Add new group membership to existing member
            existingMember.addGroupMembership({
                group_id: group._id,
                group_name: group.group_name,
                role: useRole
            });
            
            // Update verification info for new group
            existingMember.verification_otp = verificationOTP;
            existingMember.otp_expires = otpExpires;
            existingMember.phone_verified = false; // Re-verify for new group
            
            newMember = existingMember;
        } else {
            // Create new member with group membership
            const hashedPassword = await bcrypt.hash(password, 10);
            newMember = new Member({
                full_name,
                phone: formattedPhone,
                password: hashedPassword,
                group_memberships: [{
                    group_id: group._id,
                    group_name: group.group_name,
                    role: useRole,
                    status: useRole === 'admin' ? 'approved' : 'pending',
                    is_admin: useRole === 'admin'
                }],
                // Backwards compatibility fields
                group_id: group._id,
                group_name: group.group_name,
                role: useRole,
                is_admin: useRole === 'admin',
                status: useRole === 'admin' ? 'approved' : 'pending',
                phone_verified: false,
                verification_otp: verificationOTP,
                otp_expires: otpExpires
            });
        }

        await newMember.save();

        // Update group admin if this is admin
        if (useRole === 'admin') {
            await Group.findByIdAndUpdate(group._id, { admin_id: newMember._id });
        }

        console.log('📱 Generated verification OTP:', verificationOTP);
        console.log('📱 OTP expires at:', otpExpires);
        console.log('📱 Member ID:', newMember._id);

        // If SMS is disabled, auto-verify and return success
        if (!SMS_ENABLED) {
            newMember.phone_verified = true;
            newMember.verification_otp = undefined;
            newMember.otp_expires = undefined;
            await newMember.save();
            
            return res.status(201).json({ 
                message: 'Registration successful (SMS disabled - auto-verified)',
                memberId: newMember._id,
                requiresVerification: false,
                autoVerified: true
            });
        }

        // Send verification SMS
        try {
            await smsService.sendVerificationOTP(formattedPhone, verificationOTP, full_name);
            res.status(201).json({ 
                message: 'Registration submitted. Please verify your phone number with the OTP sent to your phone.',
                memberId: newMember._id,
                requiresVerification: true
            });
        } catch (smsError) {
            console.error('SMS failed, but verification code generated:', verificationOTP);
            res.status(201).json({ 
                message: 'Registration submitted. SMS delivery failed. Please contact support.',
                memberId: newMember._id,
                requiresVerification: true,
                smsError: true
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Step 2: Verify phone number
router.post('/verify-phone', async (req, res) => {
    const { memberId, otp, phone } = req.body;

    console.log('📞 Phone verification request received:');
    console.log('  - Member ID:', memberId);
    console.log('  - Phone:', phone);
    console.log('  - OTP provided:', otp);

    if ((!memberId && !phone) || !otp) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ error: 'Phone/Member ID and OTP are required' });
    }

    try {
        let member;
        if (phone) {
            const formattedPhone = formatPhoneNumber(phone);
            console.log('  - Formatted phone:', formattedPhone);
            member = await Member.findOne({ phone: formattedPhone });
        } else {
            member = await Member.findById(memberId);
        }
        
        if (!member) {
            console.log('❌ Member not found');
            return res.status(404).json({ error: 'Member not found' });
        }

        console.log('✅ Member found:');
        console.log('  - Name:', member.full_name);
        console.log('  - Stored OTP:', member.verification_otp);
        console.log('  - OTP expires:', member.otp_expires);
        console.log('  - Current time:', new Date());
        console.log('  - OTP matches:', member.verification_otp === otp);
        console.log('  - OTP expired:', new Date() > member.otp_expires);

        // Check if OTP is valid and not expired
        if (member.verification_otp !== otp || new Date() > member.otp_expires) {
            console.log('❌ Invalid or expired OTP');
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        console.log('✅ OTP validation successful');

        // Verify phone
        member.phone_verified = true;
        member.verification_otp = undefined;
        member.otp_expires = undefined;
        await member.save();

        console.log('✅ Member phone verified and saved');

        // If admin, approve immediately and send approval SMS
        if (member.role === 'admin') {
            console.log('📱 Sending admin approval SMS...');
            await smsService.sendAccountApprovalSMS(member.phone, member.full_name, member.group_name);
        }

        res.json({ 
            message: 'Phone number verified successfully!',
            status: member.status 
        });

    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resend verification OTP
router.post('/resend-verification', async (req, res) => {
    const { memberId } = req.body;

    try {
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (member.phone_verified) {
            return res.status(400).json({ error: 'Phone already verified' });
        }

        // Generate new OTP
        const verificationOTP = smsService.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        member.verification_otp = verificationOTP;
        member.otp_expires = otpExpires;
        await member.save();

        // Send new OTP
        await smsService.sendVerificationOTP(member.phone, verificationOTP, member.full_name);

        res.json({ message: 'New verification code sent' });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Step 3: Login with OTP
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password are required' });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const member = await Member.findOne({ phone: formattedPhone });
        
        if (!member) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check member status (auto-approve admins)
        if (member.role === 'admin' && member.status === 'pending') {
            member.status = 'approved';
            await member.save();
            console.log(`Auto-approved admin: ${member.phone}`);
        }

        if (member.status === 'denied') {
            return res.status(403).json({ error: 'Your membership was denied. Contact your group admin.' });
        }

        if (member.status === 'pending') {
            return res.status(403).json({ error: 'Your membership is pending admin approval.' });
        }

        if (!member.phone_verified) {
            return res.status(403).json({ error: 'Please verify your phone number first.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, member.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if SMS is disabled (testing mode)
        const SMS_ENABLED = false; // Set to true to enable SMS
        
        if (!SMS_ENABLED) {
            // Skip OTP and login directly when SMS is disabled
            const token = jwt.sign(
                { id: member._id, phone: member.phone, is_admin: member.is_admin },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                message: 'Login successful (SMS disabled)',
                token,
                member: {
                    id: member._id,
                    full_name: member.full_name,
                    phone: member.phone,
                    role: member.role,
                    is_admin: member.is_admin,
                    group_name: member.group_name
                },
                skipOTP: true
            });
        }
        
        // Generate and send login OTP
        const loginOTP = smsService.generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        member.login_otp = loginOTP;
        member.login_otp_expires = otpExpires;
        await member.save();

        await smsService.sendLoginOTP(member.phone, loginOTP, member.full_name);

        res.json({
            message: 'Login OTP sent to your phone',
            memberId: member._id,
            requiresOTP: true
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resend login OTP
router.post('/resend-login-otp', async (req, res) => {
    const { memberId } = req.body;

    if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' });
    }

    try {
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (!member.phone_verified) {
            return res.status(403).json({ error: 'Please verify your phone number first.' });
        }

        // Generate new login OTP
        const loginOTP = smsService.generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        member.login_otp = loginOTP;
        member.login_otp_expires = otpExpires;
        await member.save();

        console.log(`Login OTP for ${member.phone}: ${loginOTP}`);

        try {
            await smsService.sendLoginOTP(member.phone, loginOTP, member.full_name);
            res.json({ message: 'New login OTP sent to your phone' });
        } catch (smsError) {
            console.error('SMS failed, but login OTP generated:', loginOTP);
            res.json({ 
                message: 'SMS sending failed. Please contact support.',
                smsError: true
            });
        }

    } catch (error) {
        console.error('Error resending login OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify login OTP and get token
router.post('/verify-login', async (req, res) => {
    const { memberId, otp } = req.body;

    if (!memberId || !otp) {
        return res.status(400).json({ error: 'Member ID and OTP are required' });
    }

    try {
        const member = await Member.findById(memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if OTP is valid and not expired
        if (member.login_otp !== otp || new Date() > member.login_otp_expires) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear login OTP
        member.login_otp = undefined;
        member.login_otp_expires = undefined;
        await member.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: member._id, phone: member.phone, is_admin: member.is_admin },
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
                role: member.role,
                is_admin: member.is_admin,
                group_name: member.group_name
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Resend verification OTP using phone number
router.post('/resend-verification-phone', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const member = await Member.findOne({ phone: formattedPhone });
        
        if (!member) {
            return res.status(404).json({ error: 'No account found with this phone number' });
        }

        if (member.phone_verified) {
            return res.status(400).json({ error: 'Phone already verified. You can now log in.' });
        }

        // Generate new OTP
        const verificationOTP = smsService.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        member.verification_otp = verificationOTP;
        member.otp_expires = otpExpires;
        await member.save();

        console.log(`Manual verification code for ${formattedPhone}: ${verificationOTP}`);
        
        // Try to send SMS, but don't fail if it doesn't work
        try {
            await smsService.sendVerificationOTP(member.phone, verificationOTP, member.full_name);
            res.json({ 
                message: 'Verification code sent to your phone',
                memberId: member._id
            });
        } catch (smsError) {
            console.error('SMS failed, but verification code generated:', verificationOTP);
            res.json({ 
                message: 'SMS sending failed. Please contact support.',
                memberId: member._id,
                smsError: true
            });
        }

    } catch (error) {
        console.error('Error resending verification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manual phone verification (for testing/emergency)
router.post('/manual-verify', async (req, res) => {
    const { phone, emergencyCode } = req.body;

    // Simple emergency bypass (you can remove this in production)
    if (emergencyCode !== 'VERIFY_EMERGENCY_2024') {
        return res.status(403).json({ error: 'Invalid emergency code' });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const member = await Member.findOne({ phone: formattedPhone });
        
        if (!member) {
            return res.status(404).json({ error: 'No account found with this phone number' });
        }

        // Manually verify the phone
        member.phone_verified = true;
        member.verification_otp = null;
        member.otp_expires = null;
        await member.save();

        console.log(`Manual verification completed for ${formattedPhone}`);
        
        res.json({ 
            message: 'Phone verified manually. You can now log in.',
            success: true
        });

    } catch (error) {
        console.error('Error in manual verification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manual approval (for testing/emergency)
router.post('/manual-approve', async (req, res) => {
    const { phone, emergencyCode } = req.body;

    // Simple emergency bypass (you can remove this in production)
    if (emergencyCode !== 'APPROVE_EMERGENCY_2024') {
        return res.status(403).json({ error: 'Invalid emergency code' });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        const member = await Member.findOne({ phone: formattedPhone });
        
        if (!member) {
            return res.status(404).json({ error: 'No account found with this phone number' });
        }

        // Manually approve the member
        member.status = 'approved';
        member.phone_verified = true; // Also ensure phone is verified
        await member.save();

        console.log(`Manual approval completed for ${formattedPhone}`);
        
        res.json({ 
            message: 'Account approved manually. You can now log in.',
            success: true
        });

    } catch (error) {
        console.error('Error in manual approval:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;