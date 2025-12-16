

// ============================================================
// Seed data script - seeds/sectorSeeder.js
const mongoose = require('mongoose');
const Sector = require('./models/Sector');

const pmSectors = [
  'Agriculture and allied',
  'Automotive',
  'Aviation & Defence',
  'Banking and financial Services',
  'Cement & Building Materials',
  'Chemical Industry',
  'Consulting Services',
  'Diversified Conglomerates',
  'FMCG (Fast-Moving Consumer Goods)',
  'Gems & Jewellery',
  'Healthcare',
  'Housing',
  'Infrastructure & Construction',
  'IT and Software Development',
  'Leather and products',
  'Manufacturing & Industrial',
  'Media, Entertainment & Education',
  'Metals & Mining',
  'Oil, Gas & Energy',
  'Pharmaceutical',
  'Retail & Consumer Durables',
  'Sports',
  'Telecom',
  'Textile Manufacturing',
  'Travel & Hospitality'
];

const seedSectors = async () => {
  try {
    await Sector.deleteMany(); // Clear existing
    
    const sectorDocs = pmSectors.map(name => ({ name }));
    await Sector.insertMany(sectorDocs);
    
    console.log('Sectors seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sectors:', error);
    process.exit(1);
  }
};

mongoose.connect(process.env.MONGODB_URI).then(() => seedSectors())
    .catch(console.error);


module.exports = seedSectors;