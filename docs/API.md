# API Documentation

This document describes the REST API endpoints available in the U.S. COVID Vaccine Injuries application.

## Base URL

- **Production**: `https://covidvaccineinjury.us/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Most endpoints are public. Protected endpoints require one of:

1. **Session Cookie**: Logged in via Payload CMS admin panel (`payload-token` cookie)
2. **API Key**: Header `x-api-key: your-api-key` (set `ADMIN_API_KEY` env var)

## Security

All POST endpoints implement:

- **CSRF Protection**: Token-based with HMAC-SHA256 signatures
- **Rate Limiting**: Per-IP request limits (see individual endpoints)
- **Input Sanitization**: XSS prevention on all user inputs
- **reCAPTCHA**: Required in production (when configured)

### CSRF Token Flow

All POST endpoints require a valid CSRF token. The flow uses a double-submit pattern:

1. **Fetch a CSRF token** from `/api/csrf` - this also sets an httpOnly cookie
2. **Include the token** in subsequent POST requests via `x-csrf-token` header
3. **Include credentials** to send the associated cookie (token must match cookie)

```javascript
// Step 1: Get CSRF token (also sets httpOnly cookie with same token)
const csrfResponse = await fetch('/api/csrf', {
  credentials: 'include'  // Important: allows cookie to be set
})
const { csrfToken } = await csrfResponse.json()

// Step 2: Use token in POST request
const response = await fetch('/api/survey', {
  method: 'POST',
  credentials: 'include',  // Important: sends cookie back for validation
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken  // Token in header must match cookie
  },
  body: JSON.stringify(data)
})
```

**Alternative: Token in Request Body**

You can also include the token in the request body instead of a header:

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...formData,
    _csrf: csrfToken  // Or use 'csrfToken' field name
  })
})
```

**Using the Client Helper**

The application provides a `fetchWithCsrf` helper that handles CSRF automatically:

```typescript
import { fetchWithCsrf } from '@/lib/csrf-client'

const response = await fetchWithCsrf('/api/survey', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

**Token Details:**
- Format: `timestamp.randomBytes.signature` (e.g., `1705312200000.a1b2c3d4...64chars...e5f6g7h8...64chars`)
- Expiry: 1 hour from generation
- Cookie: `csrf_token` (httpOnly, Secure, SameSite=Strict)

**Common CSRF Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Security validation failed" | Missing or invalid token | Fetch fresh token from `/api/csrf` |
| "CSRF token expired" | Token older than 1 hour | Fetch new token |
| "Invalid CSRF cookie" | Cookie missing or cleared | Ensure `credentials: 'include'` |

**Development Mode:**
In development, localhost requests bypass CSRF validation for easier testing.

### Response Headers

All API responses include:

| Header | Value | Description |
|--------|-------|-------------|
| `X-Request-ID` | UUID | Unique request identifier for debugging |
| `Content-Type` | `application/json` | Response format |

Rate-limited responses (429) include:

| Header | Value | Description |
|--------|-------|-------------|
| `Retry-After` | seconds | Time until rate limit resets |

## Endpoints

---

### Health Check

Check if the application is running and all services are connected.

```
GET /api/health
```

**Response**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": { "status": "pass" },
    "environment": { "status": "pass" }
  }
}
```

**Status Codes**

| Code | Description |
|------|-------------|
| 200 | All services healthy |
| 503 | One or more services unhealthy |

---

### CSRF Token

Get a CSRF token for form submissions.

```
GET /api/csrf
```

**Response**

```json
{
  "csrfToken": "1705312200000.a1b2c3d4e5f6...64hexchars...e5f6g7h8...64hexchars"
}
```

The response also sets an httpOnly cookie (`csrf_token`) containing the same token value.

**Usage**

Include the token in form submissions:

```javascript
// Always include credentials to receive and send the cookie
const csrfResponse = await fetch('/api/csrf', { credentials: 'include' })
const { csrfToken } = await csrfResponse.json()

await fetch('/api/survey', {
  method: 'POST',
  credentials: 'include',  // Required: sends cookie for double-submit validation
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  },
  body: JSON.stringify(data)
})
```

---

### Survey Submission

Submit a survey response about vaccine injury experience.

```
POST /api/survey
```

**Rate Limit**: 5 requests per hour per IP

**Request Body**

```json
{
  "q1": "yes",
  "q2": "yes",
  "q3": "severe",
  "q4": "yes",
  "q5": "no",
  "q6": "no",
  "q7": "very_dissatisfied",
  "q8": ["vicp_transfer", "extend_deadline", "pain_suffering"],
  "q9": "other",
  "additionalComments": "My experience with...",
  "zipCode": "90210",
  "email": "user@example.com",
  "recaptchaToken": "03AGdBq..."
}
```

**Field Definitions**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `q1` | string | Yes | Believes injuries are real: `yes`, `no`, `unsure` |
| `q2` | string | Yes | Personally affected: `yes`, `no`, `prefer_not` |
| `q3` | string | No | Injury severity: `mild`, `moderate`, `severe`, `life_altering` |
| `q4` | string | No | Sought medical treatment: `yes`, `no` |
| `q5` | string | No | Filed CICP claim: `yes`, `no`, `in_progress`, `didnt_know` |
| `q6` | string | No | CICP claim outcome: `approved`, `denied`, `pending`, `didnt_file` |
| `q7` | string | No | CICP satisfaction: `very_satisfied` to `very_dissatisfied` |
| `q8` | array | No | Desired reforms (see values below) |
| `q9` | string | No | How heard about site |
| `additionalComments` | string | No | Free text (max 5000 chars) |
| `zipCode` | string | No | 5-digit ZIP code |
| `email` | string | No | Valid email address |
| `recaptchaToken` | string | No* | reCAPTCHA v3 token (*required in production) |

**Q8 Reform Options**

- `vicp_transfer` - Transfer to VICP
- `extend_deadline` - Extend filing deadline
- `pain_suffering` - Allow pain/suffering damages
- `attorney_fees` - Provide attorney fees
- `judicial_review` - Allow judicial review
- `injury_table` - Create injury table

**Response**

```json
{
  "success": true,
  "message": "Survey response recorded successfully"
}
```

**Error Responses**

| Code | Error | Description |
|------|-------|-------------|
| 400 | Invalid input | Missing required fields or invalid values |
| 400 | Security verification required | reCAPTCHA token missing in production |
| 403 | Security validation failed | Invalid CSRF token |
| 429 | Too many attempts | Rate limited |
| 500 | Server error | Database or internal error |

---

### Survey Statistics

Get aggregate statistics from survey responses.

```
GET /api/survey/stats
```

**Authentication Required**

**Response**

```json
{
  "totalResponses": 150,
  "statusBreakdown": {
    "new": 100,
    "reviewed": 50
  },
  "believesInjuriesReal": {
    "yes": 120,
    "no": 10,
    "unsure": 20
  },
  "personallyAffected": {
    "yes": 80,
    "no": 50,
    "prefer_not": 20
  },
  "injurySeverity": {
    "mild": 10,
    "moderate": 25,
    "severe": 30,
    "life_altering": 15
  },
  "filedClaim": {
    "yes": 20,
    "no": 45,
    "in_progress": 10,
    "didnt_know": 25
  },
  "desiredReforms": {
    "vicp_transfer": 100,
    "extend_deadline": 90,
    "pain_suffering": 110,
    "attorney_fees": 85,
    "judicial_review": 95,
    "injury_table": 70
  }
}
```

---

### Survey Export

Export all survey responses as CSV.

```
GET /api/survey/export
```

**Authentication Required**

**Response**

Returns a CSV file download with all survey responses.

**Headers**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="survey-responses-2024-01-15.csv"
```

---

### Contact Form

Submit a contact form message.

```
POST /api/contact
```

**Rate Limit**: 5 requests per hour per IP

**Content-Type**: `application/json` or `application/x-www-form-urlencoded`

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sender name (max 100 chars) |
| `email` | string | Yes | Sender email |
| `subject` | string | Yes | One of: `general`, `story`, `media`, `legislative`, `other` |
| `message` | string | Yes | Message content (max 5000 chars) |
| `recaptchaToken` | string | No* | reCAPTCHA v3 token (*required in production) |

**Response**

```json
{
  "success": true,
  "message": "Your message has been sent."
}
```

**Error Responses**

| Code | Error | Description |
|------|-------|-------------|
| 400 | Missing required fields | name, email, subject, or message not provided |
| 400 | Invalid input | Input failed sanitization |
| 403 | Security validation failed | Invalid CSRF token |
| 429 | Too many attempts | Rate limited |
| 500 | Server error | Unable to send message |

---

### Newsletter Subscribe

Subscribe an email to the newsletter.

```
POST /api/subscribe
```

**Rate Limit**: 10 requests per hour per IP

**Request Body**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "555-123-4567",
  "zip": "90210",
  "recaptchaToken": "03AGdBq..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (max 100 chars) |
| `email` | string | Yes | Valid email address |
| `phone` | string | No | Phone number (digits only after sanitization) |
| `zip` | string | No | 5-digit ZIP code |
| `recaptchaToken` | string | No* | reCAPTCHA v3 token (*required in production) |

**Response**

```json
{
  "success": true,
  "message": "Thank you for subscribing!"
}
```

**Reactivation Response** (for previously unsubscribed emails):

```json
{
  "success": true,
  "message": "Welcome back! Your subscription has been reactivated."
}
```

**Error Responses**

| Code | Error | Description |
|------|-------|-------------|
| 400 | Name is required | Missing name field |
| 400 | Email is required | Missing email field |
| 400 | Please enter a valid email address | Email doesn't match pattern |
| 400 | Please enter a valid 5-digit ZIP code | ZIP not exactly 5 digits |
| 400 | This email is already subscribed | Email already active in database |
| 400 | Security verification required | reCAPTCHA token missing in production |
| 403 | Security validation failed | Invalid CSRF token |
| 413 | Request too large | Request body exceeds 4KB |
| 429 | Too many attempts | Rate limited |

---

### Stripe Checkout

Create a Stripe Checkout session for donations.

```
POST /api/checkout
```

**Rate Limit**: 10 requests per minute per IP

**Request Body**

```json
{
  "amount": 50,
  "recurring": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Donation amount in dollars (min: $5, max: $1,000,000) |
| `recurring` | boolean | No | Monthly recurring donation (default: false) |

**Response**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_live_..."
}
```

Redirect the user to the returned URL to complete payment.

**Error Responses**

| Code | Error | Description |
|------|-------|-------------|
| 400 | Invalid amount | Amount not a valid number |
| 400 | Minimum donation is $5 | Amount below minimum |
| 400 | Maximum donation is $1,000,000 | Amount above maximum |
| 403 | Security validation failed | Invalid CSRF token |
| 429 | Too many attempts | Rate limited |
| 500 | Payment setup failed | Stripe configuration error |

---

### Donation Webhook

Stripe webhook endpoint for payment events.

```
POST /api/donation-webhook
```

**Note**: This endpoint is called by Stripe, not by your application.

**Headers Required**

```
stripe-signature: t=...,v1=...,v0=...
```

**Events Handled**

- `checkout.session.completed` - Successful payment

**Response**

```json
{
  "received": true
}
```

---

### Representatives Lookup

Find elected representatives by ZIP code.

```
GET /api/representatives?zip=90210
```

**Rate Limit**: 30 requests per hour per IP

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `zip` | string | Yes | 5-digit ZIP code |

**Response**

```json
{
  "representatives": [
    {
      "name": "John Smith",
      "party": "Democratic",
      "role": "U.S. Representative",
      "district": "CA-33",
      "phone": "(202) 555-1234",
      "address": "123 Capitol Hill, Washington, DC 20515",
      "photoUrl": "https://...",
      "channels": [
        { "type": "Twitter", "id": "repjohnsmith" },
        { "type": "Facebook", "id": "RepJohnSmith" }
      ]
    }
  ],
  "cached": false
}
```

**Caching**

Representative data is cached server-side for 24 hours. The `cached` field indicates whether the response came from cache.

**Error Responses**

| Code | Error | Description |
|------|-------|-------------|
| 400 | Invalid ZIP code | ZIP not 5 digits |
| 429 | Too many lookups | Rate limited |
| 500 | Failed to fetch | External API error |

---

### Statistics

Get public statistics for the homepage.

```
GET /api/statistics
```

**Response**

```json
{
  "statistics": [
    {
      "id": "1",
      "key": "cicp_claims",
      "value": "14046",
      "label": "Total CICP Claims",
      "description": "Total claims filed with CICP"
    }
  ]
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

For validation errors with field-specific details:

```json
{
  "error": "Validation failed",
  "fields": {
    "email": "Please enter a valid email address",
    "name": "Name is required"
  }
}
```

## Rate Limiting

Rate limits are enforced per IP address using Upstash Redis. When exceeded:

- **Status**: `429 Too Many Requests`
- **Response**: `{ "error": "Too many attempts. Please try again later." }`
- **Headers**: `Retry-After: <seconds>`

| Endpoint | Limit |
|----------|-------|
| `/api/survey` | 5 per hour |
| `/api/contact` | 5 per hour |
| `/api/subscribe` | 10 per hour |
| `/api/checkout` | 10 per minute |
| `/api/csrf` | 30 per minute |
| `/api/representatives` | 30 per hour |
| `/api/health` | 100 per minute |

**Production Behavior**: If Upstash Redis is unavailable in production, requests are **denied** (fail-closed) rather than allowed without rate limiting.

## CORS

The API accepts requests from the same origin only. Cross-origin requests are blocked unless from trusted origins configured in the middleware:

- `https://covidvaccineinjury.us`
- `https://www.covidvaccineinjury.us`
- `https://covidvaccineinjury.vercel.app`
- Vercel preview deployments (`covidvaccineinjury-*.vercel.app`)

## Versioning

This API is currently unversioned. Breaking changes will be communicated via GitHub releases.
