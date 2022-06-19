from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
import os
from twilio.rest import Client

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

ENV = "prod"

if ENV == "dev":
    app.debug = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:6969@localhost/local_db"
else:
    app.debug = False
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://lweiwqnnhibdmf:a54154b159ef15de2ea33a45f3709fb8428fbb5e5172b9ce768d0d73bd67335b@ec2-52-206-182-219.compute-1.amazonaws.com:5432/df5n57te2eck8e"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Application(db.Model):
    __tablename__ = "application"
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(200))
    lastName = db.Column(db.String(200))
    phoneNumber = db.Column(db.String(200), unique=True)
    accountId = db.Column(db.String(200), unique=True)
    serial = db.Column(db.String(200))
    approved = db.Column(db.Boolean())
    

    def __init__(self, firstName, lastName, phoneNumber, accountId):
        self.firstName = firstName
        self.lastName = lastName
        self.phoneNumber = phoneNumber
        self.accountId = accountId
        self.serial = 0
        self.approved = False

account_sid = os.environ['TWILIO_ACCOUNT_SID']
auth_token = os.environ['TWILIO_AUTH_TOKEN']
client = Client(account_sid, auth_token)

@cross_origin()
@app.route("/")
def index():
    return jsonify({"a": "b"})

@cross_origin()
@app.route("/getApplications")
def get():
    applications = db.session.query(Application).all()
    x = [{"firstName": a.firstName, "lastName": a.lastName, "phoneNumber": a.phoneNumber, "accountId": a.accountId, "approved":a.approved, "serial":a.serial} for a in applications]
    return jsonify({"results":x})

@cross_origin()
@app.route("/submitApplication", methods=['POST'])
def submitApplication():
    if request.method == 'POST':
        firstName = request.json['firstName']
        lastName = request.json['lastName']
        phoneNumber = request.json['phoneNumber']
        accountId = request.json['accountId']

        if db.session.query(Application).filter(Application.accountId == accountId).count() ==0: #Account ID not in db
            data = Application(firstName,lastName,phoneNumber,accountId)
            db.session.add(data)
            db.session.commit()
            return jsonify({"status":"success"})

    return jsonify({"status":"exists"})

@cross_origin()
@app.route("/sendVerif", methods=['POST'])
def sendVerif():
    phoneNumber = request.json['phoneNumber']
    verification = client.verify.services('VAdd114d48dd576aa127b6508e628fbc12').verifications.create(to=f"+{phoneNumber}", channel='sms')

    return jsonify({})

@cross_origin()
@app.route("/submitVerif", methods=['POST'])
def submitVerif():
    phoneNumber = request.json['phoneNumber']
    code = request.json['code']
    verification_check = client.verify.services('VAdd114d48dd576aa127b6508e628fbc12').verification_checks.create(to=f"+{phoneNumber}", code=code)

    return jsonify({"status":verification_check.status})

@cross_origin()
@app.route("/update", methods=['POST'])
def update():
    accountId = request.json['accountId']
    serial = request.json['serial']

    user = db.session.query(Application).filter(Application.accountId == accountId)[0]
    user.serial = str(serial)
    user.approved = True
    db.session.commit()
    return jsonify({})

@cross_origin()
@app.route("/getSerial")
def getSerial():
    accountId = request.args["accountId"]
    user = db.session.query(Application).filter(Application.accountId == accountId)[0]

    return jsonify({"serial": user.serial})

if __name__ == "__main__":
    app.run()
