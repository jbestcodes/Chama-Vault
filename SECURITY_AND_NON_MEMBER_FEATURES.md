# Security Enhancement & Non-Member Features

## � PWA Installation (NEW!)

### Quick Setup - No Logo Needed!

Generate placeholder icons instantly:
```bash
cd frontend
npm run generate-icons
```

This creates SVG icons with "JN" text. Replace with your real logo later!

### Google Analytics Tracking

PWA installs are automatically tracked in your Google Analytics:

**Events tracked:**
- `pwa_prompt_shown` - Install prompt displayed (iOS/Android)
- `pwa_install_accepted` - User installed the app ✅
- `pwa_install_dismissed` - User declined installation
- `pwa_prompt_dismissed` - User closed the prompt
- `pwa_launched` - App opened from home screen
- `pwa_ios_instructions_shown` - iOS instructions viewed

**View in Google Analytics:**
1. Go to Events → All Events
2. Filter by "pwa_"
3. See install rates, platforms, etc.

---

## 🔗 Non-Member Auto-Matching

### Adding Non-Members with Contact Info

```json
POST /api/savings/admin/add
{
  "non_member_name": "Jane Doe",
  "non_member_phone": "+254712345678",
  "non_member_email": "jane@example.com",
  "week_number": 1,
  "amount": 1000
}
```

When Jane registers later with that phone or email, all her savings automatically link!

### View Non-Members List

```http
GET /api/savings/non-members

Response shows phone/email:
{
  "non_members": [{
    "full_name": "Jane Doe",
    "phone": "+254712345678",
    "email": "jane@example.com",
    "total_savings": 5000
  }]
}
```

### Manual Matching (if auto-match fails)

```json
POST /api/savings/non-members/match
{
  "non_member_id": "non-member-123-jane",
  "registered_member_id": "65abc123"
}
```

### Check Potential Matches

```http
GET /api/savings/non-members/:id/potential-matches

Shows registered members with matching phone/email
```

---

## �🔐 Login OTP Verification (Enhanced Security)

### Overview
Every login now requires two-factor authentication via email OTP to protect user accounts, especially after extended periods of inactivity.

### How It Works

1. **User enters credentials** (email/phone + password)
2. **System validates credentials** and generates a 6-digit OTP
3. **OTP sent via email** with 10-minute expiration
4. **User enters OTP** to complete login
5. **Token issued** upon successful OTP verification

### Features

- ✅ OTP sent to user's verified email
- ✅ 10-minute expiration for security
- ✅ Rate limiting (3 OTP requests per hour)
- ✅ Resend OTP functionality
- ✅ Clear error messages for expired/invalid OTPs

### API Endpoints

#### 1. Login (Step 1 - Credentials)
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login OTP sent to your email",
  "requiresOTP": true,
  "memberId": "member_id_here",
  "email": "user@example.com"
}
```

#### 2. Verify Login OTP (Step 2 - Complete Login)
```http
POST /api/auth/verify-login-otp
Content-Type: application/json

{
  "memberId": "member_id_here",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "member": {
    "id": "member_id",
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "member",
    "is_admin": false,
    "group_id": "group_id",
    "group_name": "My Group"
  }
}
```

#### 3. Resend Login OTP
```http
POST /api/auth/resend-login-otp
Content-Type: application/json

{
  "memberId": "member_id_here"
}
```

**Response:**
```json
{
  "message": "New login OTP sent to your email",
  "email": "user@example.com"
}
```

### Email Template
The OTP email includes:
- 6-digit verification code (large, easy to read)
- 10-minute expiration notice
- Security warning if user didn't attempt login
- Professional branding

### Frontend Integration
The login page now has two steps:
1. **Step 1:** Email/Phone + Password
2. **Step 2:** OTP Verification

Users can resend OTP if not received or expired.

---

## 👥 Non-Member Savings Management

### Overview
Admins can now track savings for group members who don't have accounts in the app. This is useful for:
- Members without smartphones
- Members who prefer not to register
- Keeping accurate group totals

### Features

- ✅ Add savings for non-registered members
- ✅ Track multiple non-members per group
- ✅ Include non-members in savings matrix
- ✅ Calculate group totals including non-members
- ✅ Manage (add/remove) non-members

### API Endpoints

#### 1. Add Savings for Non-Member
```http
POST /api/savings/admin/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "non_member_name": "Jane Doe",
  "week_number": 1,
  "amount": 1000
}
```

**Response:**
```json
{
  "message": "Savings added successfully for Jane Doe",
  "non_member": true
}
```

#### 2. Get All Non-Members in Group
```http
GET /api/savings/non-members
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "non_members": [
    {
      "id": "non-member-group_id-jane-doe",
      "member_id": "non-member-group_id-jane-doe",
      "full_name": "Jane Doe",
      "total_savings": 5000,
      "is_non_member": true
    }
  ],
  "count": 1
}
```

#### 3. Add Non-Member to Group
```http
POST /api/savings/non-members/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "full_name": "Jane Doe"
}
```

**Response:**
```json
{
  "message": "Non-member \"Jane Doe\" added successfully. You can now add their savings.",
  "non_member": {
    "id": "non-member-group_id-jane-doe",
    "member_id": "non-member-group_id-jane-doe",
    "full_name": "Jane Doe",
    "is_non_member": true
  }
}
```

#### 4. Remove Non-Member
```http
POST /api/savings/non-members/remove
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "member_id": "non-member-group_id-jane-doe"
}
```

**Response:**
```json
{
  "message": "Non-member and all their savings removed successfully.",
  "deleted_savings": 12
}
```

### Savings Matrix Updates

The `/api/savings/matrix` endpoint now includes:

```json
{
  "members": [
    {
      "_id": "registered_member_id",
      "full_name": "John Smith",
      "phone": "+254712345678",
      "is_non_member": false
    },
    {
      "_id": "non-member-group_id-jane-doe",
      "full_name": "Jane Doe (Not Registered)",
      "phone": "N/A",
      "is_non_member": true
    }
  ],
  "weeks": [1, 2, 3, 4],
  "matrix": {
    "1": {
      "registered_member_id": 1000,
      "non-member-group_id-jane-doe": 500
    }
  },
  "groupTotal": 1500,
  "registeredCount": 1,
  "nonMemberCount": 1,
  "totalMemberCount": 2
}
```

### Database Schema Updates

**Savings Model:**
```javascript
{
  member_id: Mixed,           // ObjectId or String for non-members
  week_number: Number,
  amount: Number,
  member_name: String,        // For non-members
  is_non_member: Boolean,     // Flag
  group_id: ObjectId,         // For non-member tracking
  createdAt: Date
}
```

### Virtual Member IDs
Non-members get unique IDs in format:
```
non-member-{group_id}-{normalized-name}
```

Example: `non-member-65abc123-jane-doe`

This ensures:
- Uniqueness within a group
- Easy identification
- No conflicts with registered members

---

## 🧪 Testing

### Test Login OTP Flow

1. **Login with valid credentials:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"emailOrPhone": "test@example.com", "password": "password123"}'
   ```

2. **Check email for OTP** (6-digit code)

3. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-login-otp \
     -H "Content-Type: application/json" \
     -d '{"memberId": "member_id_from_step1", "otp": "123456"}'
   ```

### Test Non-Member Savings

1. **Add non-member:**
   ```bash
   curl -X POST http://localhost:5000/api/savings/non-members/add \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"full_name": "Test Non-Member"}'
   ```

2. **Add savings for non-member:**
   ```bash
   curl -X POST http://localhost:5000/api/savings/admin/add \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"non_member_name": "Test Non-Member", "week_number": 1, "amount": 1000}'
   ```

3. **View savings matrix:**
   ```bash
   curl -X GET http://localhost:5000/api/savings/matrix \
     -H "Authorization: Bearer <admin_token>"
   ```

---

## 🔒 Security Considerations

### Login OTP
- OTPs expire after 10 minutes
- Rate limiting: 3 requests per hour
- Email-based (more secure than SMS in some regions)
- Logged for audit purposes
- Clear error messages without revealing sensitive info

### Non-Member Data
- Only admins can manage non-members
- Non-members tied to specific groups
- Virtual IDs prevent conflicts
- All operations require authentication
- Deletion removes all associated savings

---

## 📝 Migration Notes

### Existing Users
- First login after update will require OTP
- Email must be verified before OTP can be sent
- No data migration needed

### Existing Savings
- All existing savings remain unchanged
- Non-member feature is additive only
- Backwards compatible

---

## 🚀 Future Enhancements

### Potential Improvements
1. SMS OTP as alternative to email
2. Remember device/browser (reduce OTP frequency)
3. Biometric authentication
4. Non-member contact information
5. Bulk non-member import
6. Non-member reports

---

## 📞 Support

For issues or questions:
- Check error messages in browser console
- Review server logs for OTP generation
- Verify email delivery (check spam folder)
- Contact admin for non-member access issues

---

**Last Updated:** December 24, 2025  
**Version:** 2.0
