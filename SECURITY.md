# Security Policy

## Supported Versions

Only the latest version of the AI-Enhanced Delegated Group Wallet is currently supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our application seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly** until it has been addressed by our team.
2. **Submit a detailed report** to [security@example.com], including:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any suggested fixes or mitigations (if applicable)

## What to expect

After submitting a vulnerability report:

- You'll receive an acknowledgment within 48 hours.
- We'll investigate the issue and keep you informed of our progress.
- Once the issue is confirmed, we'll work on a fix and deploy it to production.
- We'll publicly acknowledge your responsible disclosure (unless you request otherwise).

## Security Best Practices for Contributors

When contributing to this project, please ensure:

1. **API Keys and Credentials**:
   - Never commit API keys, passwords, or sensitive credentials to the repository.
   - Always use environment variables for sensitive information.

2. **Dependencies**:
   - Be cautious when adding new dependencies; consider their security history.
   - Regularly update dependencies to their latest secure versions.

3. **Input Validation**:
   - Always validate and sanitize user inputs.
   - Implement proper authorization and authentication checks.

4. **Blockchain Security**:
   - Follow best practices for wallet integrations.
   - Perform thorough validation of transaction data.
   - Consider gas limits and potential replay attacks.

5. **AI Prompt Security**:
   - Implement safeguards against prompt injection attacks.
   - Validate and sanitize data before sending to OpenAI API.
   - Monitor AI responses for potential security issues.

Thank you for helping keep our project secure!