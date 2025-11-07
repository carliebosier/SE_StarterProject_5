/**
 * Script to populate Firestore with challenge grids
 * 
 * Usage:
 * 1. Make sure Firebase is configured in src/firebase/config.js
 * 2. Run: node scripts/populateChallenges.js
 * 
 * This script creates fixed challenge grids that users can play
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to create this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Pre-defined challenge grids
const challenges = [
  {
    name: "Easy Starter",
    description: "A simple 3x3 grid to get started",
    size: 3,
    grid: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ],
    foundwords: ['ABE', 'ACE', 'BED', 'BEE', 'BEG', 'BID', 'BIG', 'CAB', 'CAD', 'DEAD', 'DEAF', 'DEED', 'DEIF', 'FACE', 'FADE', 'FADED', 'FAG', 'FED', 'FIG', 'GAB', 'GAD', 'GIB', 'HAD', 'HAG', 'HID', 'HIDE', 'IDE', 'ICE']
  },
  {
    name: "Medium Challenge",
    description: "A 4x4 grid with more possibilities",
    size: 4,
    grid: [
      ['T', 'E', 'S', 'T'],
      ['W', 'O', 'R', 'D'],
      ['G', 'A', 'M', 'E'],
      ['P', 'L', 'A', 'Y']
    ],
    foundwords: ['TEST', 'WORD', 'GAME', 'PLAY', 'TEAM', 'TEAR', 'TEAS', 'TORE', 'TORN', 'WORE', 'WORN', 'GORE', 'GORN', 'PORE', 'PORN', 'TALE', 'TAME', 'TARE', 'TEAM', 'TEAR', 'TERM', 'TOME', 'TORE', 'WALE', 'WAME', 'WARE', 'WARM', 'WART', 'WAVE', 'WORE', 'WORM', 'WORT', 'GALE', 'GAME', 'GAPE', 'GARE', 'GATE', 'GAVE', 'GORE', 'GORM', 'PALE', 'PALM', 'PALS', 'PARE', 'PARK', 'PARS', 'PART', 'PASE', 'PATE', 'PATS', 'PAVE', 'PORE', 'PORK', 'PORT', 'POSE', 'POST']
  },
  {
    name: "Hard Master",
    description: "A challenging 5x5 grid for experts",
    size: 5,
    grid: [
      ['Q', 'U', 'I', 'C', 'K'],
      ['B', 'R', 'O', 'W', 'N'],
      ['F', 'O', 'X', 'J', 'U'],
      ['M', 'P', 'S', 'V', 'E'],
      ['D', 'A', 'Z', 'E', 'L']
    ],
    foundwords: ['QUICK', 'BROWN', 'FOX', 'JUMP', 'LAZY', 'DOG', 'QUI', 'QUIB', 'QUICK', 'QUIN', 'QUIP', 'QUIT', 'BRON', 'BROW', 'BROWN', 'FOX', 'JUM', 'JUMP', 'LAZ', 'LAZY', 'DOG', 'DAZ', 'DAZE', 'DAZED', 'DAZEL', 'AZE', 'AZEL']
  },
  {
    name: "Word Master",
    description: "Challenge yourself with this 4x4 grid",
    size: 4,
    grid: [
      ['C', 'A', 'T', 'S'],
      ['D', 'O', 'G', 'S'],
      ['B', 'I', 'R', 'D'],
      ['F', 'I', 'S', 'H']
    ],
    foundwords: ['CATS', 'DOGS', 'BIRD', 'FISH', 'CAT', 'DOG', 'BIR', 'FIS', 'CAD', 'CAG', 'CAR', 'CAS', 'COD', 'COG', 'COR', 'COS', 'BID', 'BIG', 'BIN', 'BIO', 'BIR', 'BIS', 'BIT', 'FIB', 'FIG', 'FIN', 'FIR', 'FIS', 'FIT', 'ACT', 'ADO', 'ADS', 'AGS', 'AID', 'AIL', 'AIR', 'AIS', 'AIT', 'ARS', 'ART', 'ASH', 'ASS', 'ATS', 'BIO', 'BIS', 'BIT', 'BOG', 'BOR', 'BOS', 'BOT', 'BRA', 'BRO', 'CAD', 'CAG', 'CAR', 'CAS', 'CAT', 'CID', 'CIG', 'CIS', 'COD', 'COG', 'COR', 'COS', 'COT', 'CRI', 'DAB', 'DAG', 'DAR', 'DAS', 'DIB', 'DIG', 'DIN', 'DIO', 'DIR', 'DIS', 'DIT', 'DOG', 'DOR', 'DOS', 'DOT', 'FAB', 'FAD', 'FAG', 'FAR', 'FAS', 'FAT', 'FIB', 'FIG', 'FIN', 'FIR', 'FIS', 'FIT', 'FOB', 'FOG', 'FOR', 'FOS', 'FOT', 'FRA', 'FRO', 'GAB', 'GAD', 'GAR', 'GAS', 'GAT', 'GIB', 'GID', 'GIN', 'GIO', 'GIR', 'GIS', 'GIT', 'GOB', 'GOD', 'GOR', 'GOS', 'GOT', 'GRA', 'GRO', 'HAB', 'HAD', 'HAG', 'HAR', 'HAS', 'HAT', 'HIB', 'HID', 'HIN', 'HIO', 'HIR', 'HIS', 'HIT', 'HOB', 'HOD', 'HOG', 'HOR', 'HOS', 'HOT', 'HRA', 'HRO', 'IAD', 'IAG', 'IAR', 'IAS', 'IAT', 'IBO', 'IBS', 'IBT', 'ICD', 'ICG', 'ICS', 'ICT', 'IDO', 'IDR', 'IDS', 'IDT', 'IGB', 'IGD', 'IGN', 'IGO', 'IGR', 'IGS', 'IGT', 'IOB', 'IOD', 'IOG', 'IOR', 'IOS', 'IOT', 'IRA', 'IRO', 'ISB', 'ISD', 'ISG', 'ISN', 'ISO', 'ISR', 'ISS', 'IST', 'ITB', 'ITD', 'ITG', 'ITN', 'ITO', 'ITR', 'ITS', 'ITT', 'OAB', 'OAD', 'OAG', 'OAR', 'OAS', 'OAT', 'OBD', 'OBG', 'OBS', 'OBT', 'OCD', 'OCG', 'OCS', 'OCT', 'ODB', 'ODG', 'ODN', 'ODO', 'ODR', 'ODS', 'ODT', 'OGB', 'OGD', 'OGN', 'OGO', 'OGR', 'OGS', 'OGT', 'ORB', 'ORD', 'ORG', 'ORN', 'ORO', 'ORS', 'ORT', 'OSB', 'OSD', 'OSG', 'OSN', 'OSO', 'OSR', 'OSS', 'OST', 'OTB', 'OTD', 'OTG', 'OTN', 'OTO', 'OTR', 'OTS', 'OTT', 'RAB', 'RAD', 'RAG', 'RAR', 'RAS', 'RAT', 'RBD', 'RBG', 'RBS', 'RBT', 'RCD', 'RCG', 'RCS', 'RCT', 'RDB', 'RDG', 'RDN', 'RDO', 'RDR', 'RDS', 'RDT', 'RGB', 'RGD', 'RGN', 'RGO', 'RGR', 'RGS', 'RGT', 'ROB', 'ROD', 'ROG', 'RON', 'ROO', 'ROS', 'ROT', 'RSB', 'RSD', 'RSG', 'RSN', 'RSO', 'RSR', 'RSS', 'RST', 'RTB', 'RTD', 'RTG', 'RTN', 'RTO', 'RTR', 'RTS', 'RTT', 'SAB', 'SAD', 'SAG', 'SAR', 'SAS', 'SAT', 'SBD', 'SBG', 'SBS', 'SBT', 'SCD', 'SCG', 'SCS', 'SCT', 'SDB', 'SDG', 'SDN', 'SDO', 'SDR', 'SDS', 'SDT', 'SGB', 'SGD', 'SGN', 'SGO', 'SGR', 'SGS', 'SGT', 'SOB', 'SOD', 'SOG', 'SON', 'SOO', 'SOS', 'SOT', 'SSB', 'SSD', 'SSG', 'SSN', 'SSO', 'SSR', 'SSS', 'SST', 'STB', 'STD', 'STG', 'STN', 'STO', 'STR', 'STS', 'STT', 'TAB', 'TAD', 'TAG', 'TAR', 'TAS', 'TAT', 'TBD', 'TBG', 'TBS', 'TBT', 'TCD', 'TCG', 'TCS', 'TCT', 'TDB', 'TDG', 'TDN', 'TDO', 'TDR', 'TDS', 'TDT', 'TGB', 'TGD', 'TGN', 'TGO', 'TGR', 'TGS', 'TGT', 'TOB', 'TOD', 'TOG', 'TON', 'TOO', 'TOR', 'TOS', 'TOT', 'TSB', 'TSD', 'TSG', 'TSN', 'TSO', 'TSR', 'TSS', 'TST', 'TTB', 'TTD', 'TTG', 'TTN', 'TTO', 'TTR', 'TTS', 'TTT']
  }
];

async function populateChallenges() {
  try {
    console.log('Starting to populate challenges...');
    
    const challengesRef = db.collection('challenges');
    
    for (const challenge of challenges) {
      // Check if challenge already exists
      const existing = await challengesRef
        .where('name', '==', challenge.name)
        .limit(1)
        .get();
      
      if (!existing.empty) {
        console.log(`Challenge "${challenge.name}" already exists, skipping...`);
        continue;
      }
      
      // Add challenge to Firestore
      const challengeData = {
        name: challenge.name,
        description: challenge.description,
        size: challenge.size,
        grid: JSON.stringify(challenge.grid),
        foundwords: JSON.stringify(challenge.foundwords),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await challengesRef.add(challengeData);
      console.log(`✓ Added challenge "${challenge.name}" with ID: ${docRef.id}`);
    }
    
    console.log('✓ All challenges populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating challenges:', error);
    process.exit(1);
  }
}

populateChallenges();

