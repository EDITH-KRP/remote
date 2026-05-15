const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  employee_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  alternate_email: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'categories',
  timestamps: false
});

const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'sub_categories',
  timestamps: false
});

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ticket_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  ticket_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Incident'  // 'Incident' or 'Request'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sub_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  assigned_staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  short_description: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  impact: {
    type: DataTypes.STRING(20),
    defaultValue: 'Low'   // Low, Medium, High
  },
  urgency: {
    type: DataTypes.STRING(20),
    defaultValue: 'Low'   // Low, Medium, High
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'Low'
  },
  state: {
    type: DataTypes.STRING(30),
    defaultValue: 'New'   // New, In Progress, On Hold, Resolved, Closed
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Open'
  },
  attachment_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const TicketLog = sequelize.define('TicketLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ticket_logs',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false
});

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'feedback',
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: false
});

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const TicketComment = sequelize.define('TicketComment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_internal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'ticket_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


// Relationships
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.hasMany(Ticket, { foreignKey: 'assigned_staff_id', as: 'assigned_tickets' });
Ticket.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assigned_staff' });

Category.hasMany(Ticket, { foreignKey: 'category_id', as: 'tickets' });
Ticket.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Category.hasMany(SubCategory, { foreignKey: 'category_id', as: 'sub_categories' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

SubCategory.hasMany(Ticket, { foreignKey: 'sub_category_id', as: 'tickets' });
Ticket.belongsTo(SubCategory, { foreignKey: 'sub_category_id', as: 'sub_category' });

Ticket.hasMany(TicketLog, { foreignKey: 'ticket_id', as: 'logs' });
TicketLog.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

User.hasMany(TicketLog, { foreignKey: 'performed_by', as: 'logs' });
TicketLog.belongsTo(User, { foreignKey: 'performed_by', as: 'user' });

Ticket.hasOne(Feedback, { foreignKey: 'ticket_id', as: 'feedback' });
Feedback.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Ticket.hasMany(TicketComment, { foreignKey: 'ticket_id', as: 'comments' });
TicketComment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

User.hasMany(TicketComment, { foreignKey: 'author_id', as: 'authored_comments' });
TicketComment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

module.exports = {
  sequelize,
  User,
  Category,
  SubCategory,
  Ticket,
  TicketLog,
  Feedback,
  Notification,
  TicketComment
};
