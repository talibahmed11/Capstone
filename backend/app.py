import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from dotenv import load_dotenv
from pathlib import Path
from flask_cors import CORS
from datetime import datetime

# Load environment variables
load_dotenv(dotenv_path=Path('.') / '.env')
print("DEBUG:", os.getenv("EMAIL_USER"))

app = Flask(__name__)
CORS(app)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['JWT_SECRET_KEY'] = 'your_secret_key'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("EMAIL_USER")
app.config['MAIL_PASSWORD'] = os.getenv("EMAIL_PASS")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("EMAIL_USER")

db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    medications = db.relationship('Medication', backref='user', lazy=True)

class Medication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50))
    time = db.Column(db.String(50))
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_current = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify(message="Username and password required"), 400

    user = User.query.filter_by(username=username).first()
    if user and user.password == password:
        access_token = create_access_token(identity=str(user.id))
        return jsonify(message="Login successful", access_token=access_token), 200
    else:
        return jsonify(message="Invalid credentials"), 401

# Register
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify(status="error", message="All fields are required."), 400

    if User.query.filter_by(username=username).first():
        return jsonify(status="error", message="Username already exists."), 409

    try:
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()

        msg = Message(
            subject="Welcome to Road to Self-Care!",
            recipients=[email],
            html=f"""
            <h2>Welcome, {username}!</h2>
            <p>Thank you for registering with <strong>Road to Self-Care</strong>.</p>
            <p>We're excited to have you with us on your journey toward better health!</p>
            <p style=\"color: gray; font-size: 12px;\">If you didn’t register, you can ignore this message.</p>
            """
        )
        mail.send(msg)
        return jsonify(status="success", message="User registered and email sent."), 201

    except Exception as e:
        print("Registration error:", str(e))
        return jsonify(status="error", message="Internal server error."), 500

# Send reminder email
@app.route('/send_reminder', methods=['POST'])
def send_email_reminder():
    data = request.get_json()
    email = data.get('email')
    subject = data.get('subject')
    message_body = data.get('message')

    if not email or not subject or not message_body:
        return jsonify(status="error", message="Email, subject, and message are required."), 400

    try:
        msg = Message(
            subject=subject,
            recipients=[email],
            html=f"""
            <html>
                <body style=\"font-family: Arial, sans-serif; padding: 20px;\">
                    <h2 style=\"color: #2c3e50;\">Reminder</h2>
                    <p style=\"font-size: 16px;\">{message_body}</p>
                    <hr>
                    <p style=\"font-size: 12px; color: #7f8c8d;\">This is an automated reminder from Road to Self-Care.</p>
                </body>
            </html>
            """
        )
        mail.send(msg)
        return jsonify(status="success", message="Email sent successfully"), 200

    except Exception as e:
        return jsonify(status="error", message=str(e)), 500

# Add medication
@app.route('/medications', methods=['POST'])
@jwt_required()
def add_medication():
    if not request.is_json:
        return jsonify(status="error", message="Missing JSON in request"), 400

    data = request.get_json()
    name = data.get('name')
    dosage = data.get('dosage')
    time = data.get('time')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    is_current = data.get('is_current', True)
    user_id = get_jwt_identity()

    if not name:
        return jsonify(status="error", message="Medication name is required"), 400

    new_med = Medication(
        name=name,
        dosage=dosage,
        time=time,
        user_id=user_id,
        start_date=datetime.strptime(start_date, "%Y-%m-%d") if start_date else None,
        end_date=datetime.strptime(end_date, "%Y-%m-%d") if end_date else None,
        is_current=is_current
    )
    db.session.add(new_med)
    db.session.commit()

    return jsonify(status="success", message="Medication added"), 201

# Get medications with pagination + sorting + filtering
@app.route('/medications', methods=['GET'])
@jwt_required()
def get_medications():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    search = request.args.get('search', '', type=str).strip().lower()
    sort_by = request.args.get('sort_by', 'id')
    order = request.args.get('order', 'desc')

    sort_fields = {
        'id': Medication.id,
        'name': Medication.name,
        'dosage': Medication.dosage,
        'time': Medication.time
    }
    sort_column = sort_fields.get(sort_by, Medication.id)
    sort_order = sort_column.desc() if order == 'desc' else sort_column.asc()

    base_query = Medication.query.filter_by(user_id=user_id)
    if search:
        base_query = base_query.filter(Medication.name.ilike(f"%{search}%"))

    current_query = base_query.filter_by(is_current=True).order_by(sort_order)
    past_query = base_query.filter_by(is_current=False).order_by(sort_order)

    current_paginated = current_query.paginate(page=page, per_page=limit, error_out=False)
    past_paginated = past_query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "current_medications": [
            {"id": m.id, "name": m.name, "dosage": m.dosage, "time": m.time,
             "start_date": str(m.start_date), "end_date": str(m.end_date), "is_current": m.is_current}
            for m in current_paginated.items
        ],
        "past_medications": [
            {"id": m.id, "name": m.name, "dosage": m.dosage, "time": m.time,
             "start_date": str(m.start_date), "end_date": str(m.end_date), "is_current": m.is_current}
            for m in past_paginated.items
        ],
        "pages": max(current_paginated.pages, past_paginated.pages),
        "page": page,
        "limit": limit
    })

# Update medication
@app.route('/medications/<int:med_id>', methods=['PUT'])
@jwt_required()
def update_medication(med_id):
    user_id = get_jwt_identity()
    med = Medication.query.filter_by(id=med_id, user_id=user_id).first()
    if not med:
        return jsonify(status="error", message="Medication not found"), 404

    data = request.get_json()
    med.name = data.get('name', med.name)
    med.dosage = data.get('dosage', med.dosage)
    med.time = data.get('time', med.time)
    med.start_date = datetime.strptime(data['start_date'], "%Y-%m-%d") if data.get('start_date') else med.start_date
    med.end_date = datetime.strptime(data['end_date'], "%Y-%m-%d") if data.get('end_date') else med.end_date
    med.is_current = data.get('is_current', med.is_current)
    db.session.commit()

    return jsonify(status="success", message="Medication updated"), 200

# Delete medication
@app.route('/medications/<int:med_id>', methods=['DELETE'])
@jwt_required()
def delete_medication(med_id):
    user_id = get_jwt_identity()
    med = Medication.query.filter_by(id=med_id, user_id=user_id).first()
    if not med:
        return jsonify(status="error", message="Medication not found"), 404

    db.session.delete(med)
    db.session.commit()

    return jsonify(status="success", message="Medication deleted"), 200

# Run
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
