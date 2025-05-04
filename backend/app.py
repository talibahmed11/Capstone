import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from dotenv import load_dotenv
from pathlib import Path
from flask_cors import CORS
from datetime import datetime
from datetime import timedelta


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
    email = db.Column(db.String(120), nullable=False)  
    medications = db.relationship('Medication', backref='user', lazy=True)
    doctors = db.relationship('Doctor', backref='user', lazy=True)

class Medication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(50))
    time = db.Column(db.String(50))
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_current = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    refill_date = db.Column(db.Date, nullable=True)

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100))
    next_schedule = db.Column(db.Date, nullable=True)  # ✅ THIS replaces both old fields
    first_seen = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text, default="")
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50))  # 'doctor' or 'medication'
    item_id = db.Column(db.Integer)  # doctor_id or med_id
    notify_before = db.Column(db.Integer)  # in hours (24 or 168)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    email_sent = db.Column(db.Boolean, default=False)

# Authentication
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
        new_user = User(username=username, password=password, email=email)
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

@app.route('/doctors/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_doctor_profile(doc_id):
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doctor:
        return jsonify(status="error", message="Doctor not found"), 404
    return jsonify({
        "id": doctor.id,
        "name": doctor.name,
        "specialty": doctor.specialty,
        "first_seen": str(doctor.first_seen),
        "next_schedule": str(doctor.next_schedule),
        "is_active": doctor.is_active,
        "notes": doctor.notes
    })

@app.route('/doctors/<int:doc_id>/notes', methods=['PUT'])
@jwt_required()
def update_doctor_notes(doc_id):
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doctor:
        return jsonify(status="error", message="Doctor not found"), 404

    data = request.get_json()
    doctor.notes = data.get('notes', doctor.notes)
    db.session.commit()
    return jsonify(status="success", message="Notes updated")

# Doctor routes
@app.route('/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    search = request.args.get('search', '', type=str).strip().lower()
    sort_by = request.args.get('sort_by', 'id')
    order = request.args.get('order', 'desc')

    sort_fields = {
        'id': Doctor.id,
        'name': Doctor.name,
        'specialty': Doctor.specialty
    }
    sort_column = sort_fields.get(sort_by, Doctor.id)
    sort_order = sort_column.desc() if order == 'desc' else sort_column.asc()

    base_query = Doctor.query.filter_by(user_id=user_id)
    if search:
        base_query = base_query.filter(Doctor.name.ilike(f"%{search}%"))

    active_query = base_query.filter_by(is_active=True).order_by(sort_order)
    past_query = base_query.filter_by(is_active=False).order_by(sort_order)

    active_paginated = active_query.paginate(page=page, per_page=limit, error_out=False)
    past_paginated = past_query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "active_doctors": [
            {"id": d.id, "name": d.name, "specialty": d.specialty,
             "first_seen": str(d.first_seen), "next_schedule": str(d.next_schedule), "is_active": d.is_active}
            for d in active_paginated.items
        ],
        "past_doctors": [
            {"id": d.id, "name": d.name, "specialty": d.specialty,
             "first_seen": str(d.first_seen), "next_schedule": str(d.next_schedule), "is_active": d.is_active}
            for d in past_paginated.items
        ],
        "pages": max(active_paginated.pages, past_paginated.pages),
        "page": page,
        "limit": limit
    })

@app.route('/doctors', methods=['POST'])
@jwt_required()
def add_doctor():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        new_doc = Doctor(
            name=data['name'],
            specialty=data.get('specialty'),
            first_seen=datetime.strptime(data['first_seen'], "%Y-%m-%d") if data.get('first_seen') else None,
            next_schedule=datetime.strptime(data['next_schedule'], "%Y-%m-%d") if data.get('next_schedule') else None,
            is_active=data.get('is_active', True),
            notes=data.get('notes', ''),
            user_id=user_id
        )
        db.session.add(new_doc)
        db.session.commit()
        return jsonify(status="success", message="Doctor added"), 201

    except Exception as e:
        return jsonify(status="error", message=f"Failed to add doctor: {str(e)}"), 500

@app.route('/doctors/<int:doc_id>', methods=['PUT'])
@jwt_required()
def update_doctor(doc_id):
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doctor:
        return jsonify(status="error", message="Doctor not found"), 404

    data = request.get_json()
    if not data:
        return jsonify(status="error", message="Missing or invalid JSON body"), 400

    doctor.name = data.get('name', doctor.name)
    doctor.specialty = data.get('specialty', doctor.specialty)

    # Validate and parse first_seen
    if data.get('first_seen') and data['first_seen'] != 'None':
        try:
            doctor.first_seen = datetime.strptime(data['first_seen'], "%Y-%m-%d")
        except ValueError:
            return jsonify(status="error", message="Invalid first_seen format. Use YYYY-MM-DD"), 400
    else:
        doctor.first_seen = None

   
    if data.get('next_schedule') and data['next_schedule'] != 'None':
        try:
            doctor.next_schedule = datetime.strptime(data['next_schedule'], "%Y-%m-%d")
        except ValueError:
            return jsonify(status="error", message="Invalid next_schedule format. Use YYYY-MM-DD"), 400
    else:
        doctor.next_schedule = None

    doctor.is_active = data.get('is_active', doctor.is_active)
    doctor.notes = data.get('notes', doctor.notes)

    db.session.commit()
    return jsonify(status="success", message="Doctor updated"), 200



# Medication routes
@app.route('/medications', methods=['POST'])
@jwt_required()
def add_medication():
    data = request.get_json()
    user_id = get_jwt_identity()
    new_med = Medication(
        name=data.get('name'),
        dosage=data.get('dosage'),
        time=data.get('time'),
        start_date=datetime.strptime(data['start_date'], "%Y-%m-%d") if data.get('start_date') else None,
        end_date=datetime.strptime(data['end_date'], "%Y-%m-%d") if data.get('end_date') else None,
        refill_date=datetime.strptime(data['refill_date'], "%Y-%m-%d") if data.get('refill_date') else None,
        is_current=data.get('is_current', True),
        user_id=user_id
    )
    db.session.add(new_med)
    db.session.commit()
    return jsonify(status="success", message="Medication added"), 201

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
        {
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "time": m.time,
            "start_date": str(m.start_date),
            "end_date": str(m.end_date),
            "refill_date": str(m.refill_date),  # ✅ Add this line
            "is_current": m.is_current
        }
        for m in current_paginated.items
    ],
    "past_medications": [
        {
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "time": m.time,
            "start_date": str(m.start_date),
            "end_date": str(m.end_date),
            "refill_date": str(m.refill_date),  # ✅ And this line
            "is_current": m.is_current
        }
        for m in past_paginated.items
    ],
    "pages": max(current_paginated.pages, past_paginated.pages),
    "page": page,
    "limit": limit
})


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
    med.is_current = data.get('is_current', med.is_current)

    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    refill_date_str = data.get('refill_date')
    try:
        med.refill_date = datetime.strptime(refill_date_str, "%Y-%m-%d") if refill_date_str else None
    except ValueError:
        return jsonify(status="error", message="Invalid refill date format. Use YYYY-MM-DD."), 400


# Safely update start date
    try:
        med.start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
    except ValueError:
        return jsonify(status="error", message="Invalid start date format. Use YYYY-MM-DD."), 400

    # Only update end_date if is_current is False
    if not med.is_current:
        try:
            med.end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
        except ValueError:
            return jsonify(status="error", message="Invalid end date format. Use YYYY-MM-DD."), 400
    else:
        med.end_date = None  # Clear out end_date if it's now a current med

    med.is_current = data.get('is_current', med.is_current)
    db.session.commit()

    return jsonify(status="success", message="Medication updated"), 200

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

#Delete Doctor
@app.route('/doctors/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(doc_id):
    user_id = get_jwt_identity()
    doctor = Doctor.query.filter_by(id=doc_id, user_id=user_id).first()
    if not doctor:
        return jsonify(status="error", message="Doctor not found"), 404

    db.session.delete(doctor)
    db.session.commit()
    return jsonify(status="success", message="Doctor deleted"), 200

#Reminder
@app.route('/set_reminder', methods=['POST'])
@jwt_required()
def set_reminder():
    user_id = get_jwt_identity()
    data = request.get_json()

    reminder_type = data.get('type')
    item_id = data.get('id')
    time_before = data.get('time_before')

    user = User.query.get(user_id)
    if not user:
        return jsonify(status="error", message="User not found"), 404

    if reminder_type == 'doctor':
        doctor = Doctor.query.filter_by(id=item_id, user_id=user_id).first()
        if not doctor or not doctor.next_schedule:
            return jsonify(status="error", message="Invalid doctor or missing next schedule"), 400
        appointment_date = doctor.next_schedule
        label = f"Doctor: {doctor.name} appointment"
    elif reminder_type == 'medication':
        medication = Medication.query.filter_by(id=item_id, user_id=user_id).first()
        if not medication:
            return jsonify(status="error", message="Invalid medication"), 400

        # Set tomorrow as a default refill reminder for demo (you can improve this logic)
        appointment_date = medication.refill_date
        if not appointment_date:
            return jsonify(status="error", message="Medication missing refill_date"), 400
        label = f"Medication: {medication.name} refill"
    else:
        return jsonify(status="error", message="Invalid reminder type"), 400

    # Determine reminder date
    if time_before == '24h':
        reminder_date = appointment_date - timedelta(days=1)
    elif time_before == '7d':
        reminder_date = appointment_date - timedelta(days=7)
    else:
        return jsonify(status="error", message="Invalid time_before option"), 400

    # Send email now as demo (real logic would schedule it)
    try:
        msg = Message(
            subject="📅 Reminder from Road to Self-Care",
            recipients=[user.email],  # assuming username is the email
            html=f"""
                <h3>Upcoming Reminder</h3>
                <p>{label}</p>
                <p>Scheduled Date: {appointment_date.strftime("%B %d, %Y")}</p>
                <p>This is a reminder set for {time_before} before the event.</p>
            """
        )
        mail.send(msg)
        return jsonify(status="success", message="✅ Reminder email sent (demo mode)."), 200
    except Exception as e:
        print("Mail send error:", str(e))
        return jsonify(status="error", message="Failed to send email"), 500


# Run
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
