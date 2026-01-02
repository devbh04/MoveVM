import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zeromove';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Project Schema
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  files: [{
    name: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['source', 'build', 'config'],
      default: 'source'
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }],
  initData: {
    address: String,
    moduleName: String,
    packageName: String,
    faucetUrl: String,
    log: String,
    timestamp: Date
  },
  compileData: {
    success: Boolean,
    log: String,
    error: String,
    timestamp: Date
  },
  deployData: {
    success: Boolean,
    transactionHash: String,
    address: String,
    log: String,
    error: String,
    explorerUrl: String,
    timestamp: Date
  },
  deploymentHistory: [{
    type: {
      type: String,
      enum: ['init', 'compile', 'deploy'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'error'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      address: String,
      moduleName: String,
      packageName: String,
      transactionHash: String,
      explorerUrls: {
        account: String,
        transaction: String
      },
      faucetUrl: String,
      log: String,
      error: String
    }
  }],
  networkType: {
    type: String,
    default: 'testnet',
    enum: ['testnet', 'devnet', 'mainnet']
  },
  status: {
    type: String,
    default: 'created',
    enum: ['created', 'initialized', 'compiled', 'deployed']
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
projectSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export const Project = mongoose.model('Project', projectSchema);
