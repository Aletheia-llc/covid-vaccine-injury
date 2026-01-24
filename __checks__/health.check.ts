/**
 * Health Check - API Monitoring
 *
 * Monitors the /api/health endpoint to ensure the application is running
 * and all required services are connected.
 */

import { ApiCheck, AssertionBuilder } from 'checkly/constructs'

new ApiCheck('health-api-check', {
  name: 'API Health Check',
  activated: true,
  degradedResponseTime: 2000, // 2 seconds
  maxResponseTime: 5000, // 5 seconds

  request: {
    url: 'https://www.covidvaccineinjury.us/api/health',
    method: 'GET',
    assertions: [
      // Status code should be 200
      AssertionBuilder.statusCode().equals(200),

      // Response should indicate healthy status
      AssertionBuilder.jsonBody('$.status').equals('healthy'),

      // Response time should be under 2 seconds
      AssertionBuilder.responseTime().lessThan(2000),
    ],
  },

  // Tags for organizing
  tags: ['api', 'health', 'critical'],
})
