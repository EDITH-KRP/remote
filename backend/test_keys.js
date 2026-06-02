const { Ticket, User, Category, TicketLog, Feedback } = require('./src/models');

async function testKeys() {
  try {
    const ticket = await Ticket.findOne({
      include: [
        { model: TicketLog, as: 'logs' },
        { model: Feedback,  as: 'feedback' },
        { model: User,      as: 'author',         attributes: ['id', 'full_name', 'email', 'role'] },
        { model: User,      as: 'assigned_staff',  attributes: ['id', 'full_name', 'role'] },
        { model: Category,  as: 'category' }
      ]
    });
    if (ticket) {
      const json = ticket.toJSON();
      console.log('Ticket JSON keys:', Object.keys(json));
      console.log('author:', json.author);
      console.log('assigned_staff:', json.assigned_staff);
      console.log('category:', json.category);
      console.log('created_at:', json.created_at);
      console.log('updated_at:', json.updated_at);
    } else {
      console.log('No tickets found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testKeys();
