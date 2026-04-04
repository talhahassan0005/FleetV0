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
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    rejectionReason: { type: String },
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
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ZAR' },
    status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.PENDING },
    filename: { type: String },
    originalName: { type: String },
    fileUrl: { type: String },
    issuedAt: { type: Date, default: Date.now },
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

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Load = mongoose.models.Load || mongoose.model('Load', loadSchema);
export const Quote = mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
export const LoadUpdate = mongoose.models.LoadUpdate || mongoose.model('LoadUpdate', loadUpdateSchema);
export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export const TrackingLink = mongoose.models.TrackingLink || mongoose.model('TrackingLink', trackingLinkSchema);