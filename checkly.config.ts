/**
 * Checkly Configuration
 *
 * This configures synthetic monitoring for the COVID Vaccine Injury website.
 * Checks run every 5 minutes from multiple US locations.
 *
 * To deploy checks:
 *   npx checkly deploy
 *
 * To test checks locally:
 *   npx checkly test
 */

import { defineConfig } from 'checkly'

export default defineConfig({
  projectName: 'COVID Vaccine Injury',
  logicalId: 'covidvaccineinjury',
  repoUrl: 'https://github.com/Aletheia-llc/covid-vaccine-injury',

  checks: {
    // Check frequency in minutes
    frequency: 5,

    // Run from multiple US locations for redundancy
    locations: ['us-east-1', 'us-west-1'],

    // Tags for organizing checks
    tags: ['production', 'critical'],

    // Alert channels - configure in Checkly dashboard
    // alertChannels: ['email', 'slack'],

    // Runtime version for browser checks
    runtimeId: '2024.02',

    // Browser check defaults
    browserChecks: {
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },

  // CLI configuration
  cli: {
    // Run checks before deploying
    runLocation: 'us-east-1',
  },
})
