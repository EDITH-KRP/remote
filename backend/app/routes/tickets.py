from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.db import db
from app.models.models import Ticket, TicketLog, User, Category
import uuid

tickets_bp = Blueprint('tickets', __name__)

@tickets_bp.route('/create', methods=['POST'])
@jwt_required()
def create_ticket():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    ticket_number = f"TKT-{uuid.uuid4().hex[:8].upper()}"
    
    new_ticket = Ticket(
        ticket_number=ticket_number,
        user_id=current_user_id,
        category_id=data.get('category_id'),
        subject=data.get('subject'),
        description=data.get('description'),
        priority=data.get('priority', 'Low')
    )
    
    db.session.add(new_ticket)
    db.session.commit()
    
    # Log the action
    log = TicketLog(ticket_id=new_ticket.id, action='Ticket Created', performed_by=current_user_id)
    db.session.add(log)
    db.session.commit()
    
    return jsonify(new_ticket.to_dict()), 201

@tickets_bp.route('', methods=['GET'])
@jwt_required()
def get_tickets():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'admin':
        tickets = Ticket.query.all()
    elif user.role == 'support':
        tickets = Ticket.query.filter_by(assigned_staff_id=user.id).all()
    else:
        tickets = Ticket.query.filter_by(user_id=user.id).all()
        
    return jsonify([t.to_dict() for t in tickets]), 200

@tickets_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_ticket(id):
    ticket = Ticket.query.get_or_404(id)
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_ticket(id):
    current_user_id = get_jwt_identity()
    ticket = Ticket.query.get_or_404(id)
    data = request.get_json()
    
    if 'status' in data:
        ticket.status = data['status']
        log = TicketLog(ticket_id=ticket.id, action=f"Status changed to {data['status']}", performed_by=current_user_id)
        db.session.add(log)
        
    if 'assigned_staff_id' in data:
        ticket.assigned_staff_id = data['assigned_staff_id']
        log = TicketLog(ticket_id=ticket.id, action=f"Assigned to user {data['assigned_staff_id']}", performed_by=current_user_id)
        db.session.add(log)
        
    db.session.commit()
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_ticket(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    ticket = Ticket.query.get_or_404(id)
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({'message': 'Ticket deleted'}), 200
