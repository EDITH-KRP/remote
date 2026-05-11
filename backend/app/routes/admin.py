from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.db import db
from app.models.models import Ticket, User, Category

admin_bp = Blueprint('admin', __name__)

@admin_bp.before_request
@jwt_required()
def check_admin():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

@admin_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/assign-ticket', methods=['POST'])
def assign_ticket():
    data = request.get_json()
    ticket_id = data.get('ticket_id')
    staff_id = data.get('staff_id')
    
    ticket = Ticket.query.get_or_404(ticket_id)
    ticket.assigned_staff_id = staff_id
    ticket.status = 'Assigned'
    
    db.session.commit()
    return jsonify({'message': 'Ticket assigned successfully', 'ticket': ticket.to_dict()}), 200

@admin_bp.route('/reports', methods=['GET'])
def get_reports():
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='Open').count()
    resolved_tickets = Ticket.query.filter_by(status='Resolved').count()
    
    # Example report
    report = {
        'total_tickets': total_tickets,
        'open_tickets': open_tickets,
        'resolved_tickets': resolved_tickets,
    }
    return jsonify(report), 200

@admin_bp.route('/categories', methods=['GET', 'POST'])
def handle_categories():
    if request.method == 'POST':
        data = request.get_json()
        new_category = Category(
            category_name=data.get('category_name'),
            description=data.get('description')
        )
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.to_dict()), 201
        
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200
