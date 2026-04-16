import mongoose from 'mongoose';

// Enums
export const Role = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  TRANSPORTER: 'TRANSPORTER',
};

export const LoadStatus = {
  PENDING: 'PENDING',
  QUOTING: 'QUOTING',
  QUOTED: 'QUOTED',
  APPROVED: 'APPROVED',
  ASSIGNED: 'ASSIGNED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const QuoteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

export const InvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
};

export const DocType = {
  COMPANY: 'COMPANY',
  REGISTRATION: 'REGISTRATION',
  CUSTOMS: 'CUSTOMS',
  POD: 'POD',
  INVOICE: 'INVOICE',
  OTHER: 'OTHER',
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
    companyName: { type: String },
    contactName: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      province: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    bankAccount: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    rejectionReason: { type: String },
    // QuickBooks Integration Fields
    quickbooksAccounts: [
      {
        country: { type: String, required: true },      // 'ZA', 'BW', 'ZW', etc.
        currency: { type: String, required: true },      // 'ZAR', 'BWP', 'USD', etc.
        realmId: { type: String, required: true },
        accessToken: { type: String },
        refreshToken: { type: String },
        tokenExpiresAt: { type: Date },
        connectedAt: { type: Date },
        isConnected: { type: Boolean, default: false },
        label: { type: String },                         // e.g. 'South Africa', 'Botswana'
        customerId: { type: String }, // QB Customer ID
        customerSyncToken: { type: String },
        customerSyncedAt: { type: Date },
        vendorId: { type: String }, // QB Vendor ID
        vendorSyncToken: { type: String },
        vendorSyncedAt: { type: Date },
      }
    ],
    // Keep old quickbooks field for backward compatibility but mark deprecated
    quickbooks: {
      isConnected: { type: Boolean, default: false },
      realmId: { type: String },
      accessToken: { type: String }, // Encrypt in production!
      refreshToken: { type: String }, // Encrypt in production!
      tokenExpiresAt: { type: Date },
      customerId: { type: String }, // QB Customer ID (for clients)
      customerSyncToken: { type: String },
      customerSyncedAt: { type: Date },
      vendorId: { type: String }, // QB Vendor ID (for transporters)
      vendorSyncToken: { type: String },
      vendorSyncedAt: { type: Date },
      connectedAt: { type: Date },
      disconnectedAt: { type: Date },
    },
  },
  { timestamps: true }
);

const loadSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoType: { type: String },
    weight: { type: String },
    collectionDate: { type: String },
    deliveryDate: { type: String },
    specialInstructions: { type: String },
    status: { type: String, enum: Object.values(LoadStatus), default: LoadStatus.PENDING },
    assignedTransporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    finalPrice: { type: Number },
    currency: { type: String, default: 'ZAR' },
    country: { type: String, default: 'ZA' },
  },
  { timestamps: true }
);

const quoteSchema = new mongoose.Schema(
  {
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    notes: { type: String },
    status: { type: String, enum: Object.values(QuoteStatus), default: QuoteStatus.PENDING },
  },
  { timestamps: true }
);

const loadUpdateSchema = new mongoose.Schema(
  {
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    statusChange: { type: String },
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
    docType: { type: String, enum: Object.values(DocType), required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedByRole: { type: String, enum: Object.values(Role), required: true },
    visibleTo: { type: String, default: 'ADMIN' },
    documentCategory: { type: String, enum: ['REGISTRATION', 'LOAD'], default: 'REGISTRATION' },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    verificationComment: { type: String },
    reviews: [
      {
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewerRole: { type: String, enum: Object.values(Role) },
        status: { type: String, enum: ['APPROVED', 'REJECTED', 'PENDING'], default: 'PENDING' },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    podId: { type: mongoose.Schema.Types.ObjectId, ref: 'POD' },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ZAR' },
    tonnageForThisInvoice: { type: Number }, // For partial invoices
    totalLoadTonnage: { type: Number },
    tonnageDeliveredSoFar: { type: Number },
    transporterInvoice: {
      invoiceNumber: { type: String },
      amount: { type: Number },
      date: { type: Date },
      pdfUrl: { type: String },
    },
    clientInvoice: {
      invoiceNumber: { type: String },
      amount: { type: Number },
      date: { type: Date },
      markup: { type: Number },
      markupPercentage: { type: Number },
      sentVia: { type: String, enum: ['quickbooks', 'email'], default: 'quickbooks' },
    },
    paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL_PAID', 'PAID'], default: 'UNPAID' },
    totalPaidAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number },
    paymentTrackedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentNotes: { type: String },
    comments: { type: String },
    status: { type: String, enum: ['PENDING_ADMIN_APPROVAL', 'SENT_TO_CLIENT', 'AWAITING_PAYMENT', 'PAID', 'REJECTED', 'DRAFT'], default: 'DRAFT' },
    filename: { type: String },
    originalName: { type: String },
    fileUrl: { type: String },
    issuedAt: { type: Date, default: Date.now },
    // QuickBooks Integration
    qb_sync: {
      invoiceId: { type: String }, // QB Invoice ID
      invoiceSyncToken: { type: String },
      billId: { type: String }, // QB Bill ID (for transporter)
      billSyncToken: { type: String },
      paymentStatus: { type: String }, // QB payment status
      createdAt: { type: Date },
      lastSyncedAt: { type: Date },
      syncErrors: { type: String },
    },
  },
  { timestamps: true }
);

const podSchema = new mongoose.Schema(
  {
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    podDocument: {
      filename: { type: String },
      url: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },
    transporterInvoice: {
      filename: { type: String },
      url: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },
    deliveryDate: { type: Date },
    deliveryTime: { type: String },
    notes: { type: String },
    adminApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
    },
    clientApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
      comments: { type: String },
    },
    status: { type: String, enum: ['PENDING_ADMIN', 'PENDING_CLIENT', 'APPROVED', 'REJECTED'], default: 'PENDING_ADMIN' },
  },
  { timestamps: true }
);

const trackingLinkSchema = new mongoose.Schema(
  {
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    token: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    expiredAt: { type: Date },
  },
  { timestamps: true }
);

const qbCountryConfigSchema = new mongoose.Schema({
  country: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  currency: { type: String, required: true },
  flag: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Chat Models - FIX for bug #2: Proper conversation tracking
const conversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true }, // Format: sorted(id1,id2)
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userRole: { type: String, enum: Object.values(Role), required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    lastMessageSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    unreadCount: { type: Map, of: Number, default: new Map() }, // { userId: unreadCount }
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true }, // Consistent across both users
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: Object.values(Role), required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    loadRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' }, // Optional, for load context
  },
  { timestamps: true }
);

// Create indexes for faster queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
conversationSchema.index({ 'participants.userId': 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Load = mongoose.models.Load || mongoose.model('Load', loadSchema);
export const Quote = mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
export const LoadUpdate = mongoose.models.LoadUpdate || mongoose.model('LoadUpdate', loadUpdateSchema);
export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export const POD = mongoose.models.POD || mongoose.model('POD', podSchema);
export const TrackingLink = mongoose.models.TrackingLink || mongoose.model('TrackingLink', trackingLinkSchema);
export const QBCountryConfig = mongoose.models.QBCountryConfig || mongoose.model('QBCountryConfig', qbCountryConfigSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);