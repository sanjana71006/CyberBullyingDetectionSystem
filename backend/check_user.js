import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import User from './src/models/User.js';

const uri = 'mongodb+srv://vortexcorelmrvs_db_user:CyberwithVortexcore@cyberbullyingdetector.usgtjbl.mongodb.net/';

async function check() {
  await mongoose.connect(uri);
  
  const msgCount = await Message.countDocuments();
  console.log('Total messages in DB:', msgCount);
  
  const recent = await Message.find().sort({ timestamp: -1 }).limit(5);
  console.log('Recent messages:');
  recent.forEach(m => console.log(`  pred=${m.prediction} toxicity=${m.toxicityScore} text="${m.text.slice(0, 40)}"`));

  const users = await User.find({}).select('username email role');
  console.log('\nAll users and roles:');
  users.forEach(u => console.log(`  ${u.username} (${u.email}) - role: ${u.role}`));

  process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
