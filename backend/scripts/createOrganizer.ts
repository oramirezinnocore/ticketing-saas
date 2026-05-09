import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/modules/users/user.model';
import { UserRole } from '../src/modules/users/user.interface';

const ORGANIZER_DATA = {
  name: 'Test Organizer',
  email: 'organizer@test.com',
  password: 'Organizer123!',
  role: UserRole.ORGANIZER,
};

const createOrganizer = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();

    // Check if organizer already exists
    const existingUser = await User.findOne({ email: ORGANIZER_DATA.email });

    if (existingUser) {
      console.log('⚠️  Organizer already exists');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   ID: ${String(existingUser._id)}`);
      await disconnectDatabase();
      process.exit(0);
      return;
    }

    // Create new organizer user
    const organizer = new User(ORGANIZER_DATA);
    await organizer.save();

    console.log('✅ Organizer created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log(`   Email:    ${ORGANIZER_DATA.email}`);
    console.log(`   Password: ${ORGANIZER_DATA.password}`);
    console.log(`   Role:     ${ORGANIZER_DATA.role}`);
    console.log('');
    console.log('🔗 User Details:');
    console.log(`   ID:   ${String(organizer._id)}`);
    console.log(`   Name: ${organizer.name}`);
    console.log('');
    console.log('💡 You can now login as organizer at /login');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create organizer:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

void createOrganizer();
