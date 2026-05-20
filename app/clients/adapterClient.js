function getBaseUrl() {
  const url = (process.env.ADAPTER_BASE_URL || '').trim();
  return url.replace(/\/$/, '');
}

function isMockMode() {
  if (process.env.ADAPTER_USE_MOCK === 'true') return true;
  return getBaseUrl() === '';
}

const mockPatients = [
  {
    _id: '69b6947d833e04011f7406bd',
    name: 'Juan Dela Cruz',
    birthdate: '1985-04-12T00:00:00.000Z',
    address: 'Quezon City',
    phone: '09171234567',
  },
  {
    _id: '69b6a2b0f1ab5c7aa5bf10c5',
    name: 'Maria Santos',
    birthdate: '1990-09-21T00:00:00.000Z',
    address: 'Manila',
    phone: '09181234567',
  },
];

const mockConsultations = [
  {
    _id: '69b6a6cde5293c92e948cd28',
    patientId: '69b6947d833e04011f7406bd',
    appointmentId: '69b6aa9de5293c92e948cd2c',
    diagnosis: 'Skin allergy',
    prescription: 'Cetirizine',
    notes: 'Follow up after 1 week',
  },
];

const mockAppointments = [
  {
    _id: '69b6a496f1ab5c7aa5bf10d0',
    patientId: '69b6947d833e04011f7406bd',
    doctorName: 'Dr. Lopez',
    department: 'Pediatrics',
    appointmentDate: '2026-03-22T10:00:00.000Z',
    appointmentStatus: 'Scheduled',
  },
  {
    _id: '69b6a42cf1ab5c7aa5bf10cb',
    patientId: '699faf2d57354ad8d0ad70cb',
    doctorName: 'Dr. Santos',
    department: 'Cardiology',
    appointmentDate: '2026-03-20T09:00:00.000Z',
    appointmentStatus: 'Scheduled',
  },
];

const mockBilling = [
  {
    _id: '69b6abf9e5293c92e948cd31',
    patientId: '69b6a2b0f1ab5c7aa5bf10c5',
    serviceDescription: 'General Consultation',
    amount: '1000',
    dateIssued: '2026-03-19',
    billingStatus: 'Paid',
  },
];

function assertConfiguredForLive() {
  if (isMockMode()) {
    const err = new Error('Adapter is in mock mode or ADAPTER_BASE_URL is not set');
    err.status = 503;
    err.expose = true;
    throw err;
  }
}

async function adapterRequest(path, options = {}) {
  assertConfiguredForLive();
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Adapter request failed (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    err.expose = true;
    throw err;
  }
  return data;
}

function normalizeAdapterResponse(data) {
  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data;
  }
  return data;
}

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

function splitAddress(address = '') {
  const [streetAddress, city] = String(address).split(',').map((part) => part.trim());
  return {
    streetAddress: streetAddress || null,
    city: city || '',
  };
}

function formatBasicPatient(patient) {
  if (!patient || typeof patient !== 'object') return null;

  const name = patient.name || [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  const address = patient.address || [patient.streetAddress, patient.city].filter(Boolean).join(', ').trim();
  const phone = patient.phone || patient.contactNumber || null;

  return {
    _id: patient._id || patient.id || patient.legacyId || patient.patientId || null,
    name: name || null,
    birthdate: patient.birthdate || patient.dob || null,
    address: address || null,
    phone,
  };
}

function formatConsultation(record) {
  return {
    _id: record._id || record.consultationId || record.id || null,
    patientId: record.patientId || null,
    appointmentId: record.appointmentId || null,
    doctorId: record.doctorId || null,
    date: record.date || record.createdAt || null,
    notes: record.notes || record.doctorNotes || record.clinicalFinding || null,
    prescription: record.prescription || record.rx || null,
  };
}

function formatAppointment(record) {
  return {
    _id: record._id || record.id || null,
    patientId: record.patientId || null,
    doctorId: record.doctorId || record.doctor || null,
    dateTime: record.appointmentDate || record.date || null,
    status: record.appointmentStatus || record.status || null,
    department: record.department || record.dept || null,
  };
}

function formatBilling(record) {
  return {
    _id: record._id || record.billingId || record.id || null,
    patientId: record.patientId || null,
    amount: record.amount != null ? Number(record.amount) : record.cost != null ? Number(record.cost) : null,
    status: record.billingStatus || record.status || null,
    date: record.date || record.dateIssued || record.issuedDate || null,
    description: record.serviceDescription || record.description || null,
  };
}

async function createPatientProfile(payload, token) {
  if (isMockMode()) {
    const created = {
      _id: `mock-patient-${Date.now()}`,
      name: payload.name,
      birthdate: payload.birthdate,
      address: payload.address,
      phone: payload.phone,
    };
    mockPatients.unshift(created);
    return formatBasicPatient(created);
  }

  const { firstName, lastName } = splitName(payload.name);
  const { streetAddress, city } = splitAddress(payload.address);
  const adapterPayload = {
    firstName,
    lastName,
    dob: payload.birthdate,
    streetAddress,
    city,
    contactNumber: payload.phone,
  };

  const authHeaders = buildAuthHeaders(token);

  const created = normalizeAdapterResponse(
    await adapterRequest('/patients/create', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(adapterPayload || {}),
    })
  );

  const patientId = created?.legacyId || created?.id || created?._id;
  if (patientId) {
    const fetched = normalizeAdapterResponse(
      await adapterRequest(`/patients/${patientId}`, {
        method: 'GET',
        headers: authHeaders,
      })
    );
    return formatBasicPatient(fetched);
  }

  return formatBasicPatient({
    _id: patientId || null,
    name: payload.name,
    birthdate: payload.birthdate,
    address: payload.address,
    phone: payload.phone,
  });
}

async function getPatientProfiles(token) {
  if (isMockMode()) {
    return mockPatients.map(formatBasicPatient);
  }

  const data = normalizeAdapterResponse(
    await adapterRequest('/patients', {
      method: 'GET',
      headers: buildAuthHeaders(token),
    })
  );

  if (!Array.isArray(data)) return [];
  return data.map(formatBasicPatient);
}

async function getPatientRecords(patientId, token) {
  if (isMockMode()) {
    const patient = mockPatients.find((item) => item._id === patientId);
    if (!patient) {
      const err = new Error('Patient not found');
      err.status = 404;
      err.expose = true;
      throw err;
    }
    return {
      patient: formatBasicPatient(patient),
      consultations: mockConsultations.filter((item) => item.patientId === patientId).map(formatConsultation),
      appointments: mockAppointments.filter((item) => item.patientId === patientId).map(formatAppointment),
      billing: mockBilling.filter((item) => item.patientId === patientId).map(formatBilling),
    };
  }

  const authHeaders = buildAuthHeaders(token);
  const [patientResponse, consultationResponse, appointmentResponse, billingResponse] = await Promise.all([
    adapterRequest(`/patients/${patientId}`, {
      method: 'GET',
      headers: authHeaders,
    }),
    adapterRequest(`/consultation/history/${patientId}`, {
      method: 'GET',
      headers: authHeaders,
    }),
    adapterRequest(`/appointment/patient/${patientId}`, {
      method: 'GET',
      headers: authHeaders,
    }),
    adapterRequest(`/billing/history/${patientId}`, {
      method: 'GET',
      headers: authHeaders,
    }),
  ]);

  const patient = formatBasicPatient(normalizeAdapterResponse(patientResponse));
  const consultationsData = normalizeAdapterResponse(consultationResponse);
  const appointmentData = normalizeAdapterResponse(appointmentResponse);
  const billingData = normalizeAdapterResponse(billingResponse);

  const consultations = Array.isArray(consultationsData)
    ? consultationsData.map(formatConsultation)
    : [];
  const appointments = Array.isArray(appointmentData)
    ? appointmentData.map(formatAppointment)
    : [];
  const billing = Array.isArray(billingData)
    ? billingData.map(formatBilling)
    : [];

  return {
    patient,
    consultations,
    appointments,
    billing,
  };
}

module.exports = {
  getBaseUrl,
  isMockMode,
  adapterRequest,
  createPatientProfile,
  getPatientProfiles,
  getPatientRecords,
};
