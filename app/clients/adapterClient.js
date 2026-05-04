/**
 * HTTP client for the Adapter Layer (only path to legacy HAS data).
 * Phase 1: exposes configuration and a no-network health check; CRUD methods added with patient/doctor slices.
 */

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

function formatBasicPatient(patient) {
  return {
    id: patient._id || patient.id,
    name: patient.name || null,
    birthdate: patient.birthdate || null,
    address: patient.address || null,
    phone: patient.phone || null,
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

  const data = await adapterRequest('/patients', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload || {}),
  });

  return formatBasicPatient(data);
}

async function getPatientProfiles(token) {
  if (isMockMode()) {
    return mockPatients.map(formatBasicPatient);
  }

  const data = await adapterRequest('/patients', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

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
      consultations: mockConsultations.filter((item) => item.patientId === patientId),
      appointments: mockAppointments.filter((item) => item.patientId === patientId),
      billing: mockBilling.filter((item) => item.patientId === patientId),
    };
  }

  const data = await adapterRequest(`/patients/${patientId}/records`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return {
    patient: data?.patient ? formatBasicPatient(data.patient) : null,
    consultations: Array.isArray(data?.consultations) ? data.consultations : [],
    appointments: Array.isArray(data?.appointments) ? data.appointments : [],
    billing: Array.isArray(data?.billing) ? data.billing : [],
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
