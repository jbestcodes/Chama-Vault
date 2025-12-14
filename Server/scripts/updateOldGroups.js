/**
 * Script to update old groups created before group_type feature
 * Run this once to add group_type to existing groups
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Group = require('../models/Group');

async function updateOldGroups() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all groups without group_type or with null/undefined group_type
        const groupsToUpdate = await Group.find({
            $or: [
                { group_type: { $exists: false } },
                { group_type: null },
                { group_type: '' }
            ]
        });

        console.log(`📊 Found ${groupsToUpdate.length} groups to update`);

        if (groupsToUpdate.length === 0) {
            console.log('✅ All groups already have group_type set!');
            process.exit(0);
        }

        // Update each group
        for (const group of groupsToUpdate) {
            // Default to 'savings_and_loans' for existing groups
            group.group_type = 'savings_and_loans';
            await group.save();
            console.log(`✅ Updated group: ${group.group_name} -> ${group.group_type}`);
        }

        console.log(`\n🎉 Successfully updated ${groupsToUpdate.length} groups!`);
        console.log('All existing groups now have group_type set to "savings_and_loans"');
        console.log('You can change them to "table_banking" in the admin panel if needed.\n');

    } catch (error) {
        console.error('❌ Error updating groups:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
}

// Run the update
updateOldGroups();
