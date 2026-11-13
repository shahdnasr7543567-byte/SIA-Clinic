const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const { ENV } = require('../dist/config/env.js');
const { Patient } = require('../dist/models/Patient.js');
const { Clinic } = require('../dist/models/Clinic.js');
const { Queue } = require('../dist/models/Queue.js');
const { Booking } = require('../dist/models/Booking.js');
const { Prescription } = require('../dist/models/Prescription.js');
const bookingRouter = require('../dist/routes/booking.routes.js').default;
const { getPatientStats } = require('../dist/controllers/patient.controller.js');
const { getMyBookings } = require('../dist/controllers/patientPortal.controller.js');

test('patient booking uses authenticated identity and public validation remains required', async (t) => {
  const clinicId = new Types.ObjectId();
  const patient = { _id: new Types.ObjectId(), clinicId, name: 'Patient Name', mobile: '01012345678', age: 32 };
  t.mock.method(Patient, 'findById', async () => patient);
  t.mock.method(Patient, 'findOne', async (query) => {
    assert.equal(String(query._id), String(patient._id));
    assert.equal(String(query.clinicId), String(clinicId));
    return patient;
  });
  t.mock.method(Clinic, 'findById', async () => ({ settings: { dailyCapacity: 50 } }));
  t.mock.method(Queue, 'countDocuments', async () => 0);
  t.mock.method(Queue, 'findOne', () => ({ sort: async () => null }));
  t.mock.method(Queue, 'create', async (data) => ({ ...data, _id: new Types.ObjectId() }));
  let saved;
  t.mock.method(Booking, 'create', async (data) => (saved = { ...data, _id: new Types.ObjectId() }));
  const app = express();
  app.use(express.json(), bookingRouter);
  const server = app.listen(0);
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/`;
  const body = { examType: 'examination', date: '2026-11-20', time: '10:00', paymentMethod: 'cash' };
  const token = jwt.sign({ id: String(patient._id), role: 'patient' }, ENV.JWT_SECRET);
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...body, patientName: 'Imposter', age: 1, mobile: '000' }) });
  assert.equal(response.status, 201);
  assert.equal(saved.patientName, patient.name);
  assert.equal(saved.mobile, patient.mobile);
  assert.equal(saved.age, patient.age);
  const invalid = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid' }, body: JSON.stringify(body) });
  assert.equal(invalid.status, 401);
  // Public requests continue to require identifying information.
  t.mock.method(Clinic, 'findOne', async () => ({ _id: clinicId }));
  const publicResponse = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(publicResponse.status, 400);
});

test('stats return scoped prescription counts and monthly visit data', async (t) => {
  const clinicId = new Types.ObjectId();
  const id = String(new Types.ObjectId());
  const visits = [{ visitDate: '2026-01-02' }, { visitDate: '2026-03-05' }];
  const prescriptions = [{ diagnosis: 'Headache', createdAt: new Date('2026-01-02') }];
  t.mock.method(Queue, 'find', (query) => { assert.equal(query.clinicId, clinicId); assert.equal(query.patientId, id); return { sort: async () => visits }; });
  t.mock.method(Prescription, 'find', (query) => { assert.equal(query.clinicId, clinicId); assert.equal(query.patientId, id); return { sort: async () => prescriptions }; });
  let result;
  await getPatientStats({ params: { id }, clinicId }, { status() { return this; }, json(data) { result = data; } }, (error) => { throw error; });
  assert.equal(result.prescriptionsCount, 1);
  assert.equal(result.totalVisits, 2);
  assert.equal(result.avgMonthlyVisits, 0.67);
  assert.deepEqual(result.monthlyVisits, [{ month: '2026-01', visits: 1 }, { month: '2026-03', visits: 1 }]);
});

test('booking history returns all supported statuses', async (t) => {
  const clinicId = new Types.ObjectId();
  const statuses = ['pending', 'confirmed', 'done', 'completed', 'cancelled'];
  for (const status of statuses) assert.equal(new Booking({ status }).validateSync()?.errors?.status, undefined);
  t.mock.method(Booking, 'find', (query) => {
    assert.deepEqual(query, { clinicId, mobile: '01012345678' });
    return { sort: async () => statuses.map((status) => ({ _id: new Types.ObjectId(), status, createdAt: new Date() })) };
  });
  let result;
  await getMyBookings({ patient: { mobile: '01012345678' }, clinicId }, { status() { return this; }, json(data) { result = data; } }, (error) => { throw error; });
  assert.deepEqual(result.map((booking) => booking.status), statuses);
});
