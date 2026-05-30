export const testData = {
  machines: {
    validMachineId: 'excavator-001',
    keywords: ['excavator', 'crane', 'bulldozer', 'forklift'],
    invalidId: 'nonexistent-machine-999',
  },
  booking: {
    startDate: '2026-06-01',
    endDate: '2026-06-07',
  },
  users: {
    valid: {
      email: process.env.TEST_USER_EMAIL ?? 'test@example.com',
      password: process.env.TEST_USER_PASSWORD ?? 'password',
    },
    invalid: {
      email: 'invalid@test.com',
      password: 'wrongpassword',
    },
  },
};
