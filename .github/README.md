# GitHub CI/CD Workflows Documentation

This directory contains all the CI/CD workflows and GitHub-specific configurations for the Pocket Counsel project.

## 📁 Directory Structure

```
.github/
├── workflows/           # GitHub Actions workflows
│   ├── ci.yml          # Continuous Integration
│   ├── deploy.yml      # Deployment pipeline
│   ├── release.yml     # Release management
│   ├── dependency-update.yml  # Automated dependency updates
│   ├── codeql.yml      # Security analysis
│   └── performance.yml # Performance monitoring
├── ISSUE_TEMPLATE/     # Issue templates
│   ├── bug_report.md   # Bug report template
│   └── feature_request.md # Feature request template
├── dependabot.yml      # Dependabot configuration
├── pull_request_template.md # PR template
└── README.md           # This file
```

## 🔄 Workflows Overview

### 1. CI Pipeline (`ci.yml`)

**Triggers**: Push to main/develop, Pull requests
**Purpose**: Code quality, testing, and security checks

**Jobs**:

- **Lint & Type Check**: ESLint, TypeScript compilation
- **Build**: Build all packages and create artifacts
- **Test**: Run unit and integration tests
- **Security**: npm audit, Snyk vulnerability scanning
- **Dependency Review**: Automated dependency analysis

### 2. Deployment Pipeline (`deploy.yml`)

**Triggers**: Push to main, Manual dispatch
**Purpose**: Automated deployment to staging/production

**Jobs**:

- **Deploy Web App**: Firebase Hosting deployment
- **Deploy Functions**: Google Cloud Functions deployment
- **Health Checks**: Post-deployment verification
- **Notifications**: Slack notifications for deployment status

### 3. Release Management (`release.yml`)

**Triggers**: Tag push (v\*)
**Purpose**: Automated release creation and distribution

**Jobs**:

- **Create Release**: Generate changelog and GitHub release
- **Build Assets**: Create release packages
- **Notifications**: Notify stakeholders about releases

### 4. Dependency Updates (`dependency-update.yml`)

**Triggers**: Weekly schedule, Manual dispatch
**Purpose**: Keep dependencies up-to-date and secure

**Jobs**:

- **Update Dependencies**: Automated dependency updates
- **Security Audit**: Vulnerability scanning
- **Notifications**: Alert about updates and security issues

### 5. Security Analysis (`codeql.yml`)

**Triggers**: Push to main/develop, Weekly schedule
**Purpose**: Static code analysis for security vulnerabilities

**Jobs**:

- **CodeQL Analysis**: GitHub's semantic code analysis
- **Security Notifications**: Alert on security findings

### 6. Performance Monitoring (`performance.yml`)

**Triggers**: Push to main, Daily schedule, Manual dispatch
**Purpose**: Track and monitor application performance

**Jobs**:

- **Lighthouse Audit**: Web performance metrics
- **Bundle Analysis**: JavaScript bundle size monitoring
- **API Performance**: Backend performance testing
- **Regression Detection**: Performance regression alerts

## 🔧 Configuration

### Required Secrets

Add these secrets to your GitHub repository settings:

#### Deployment Secrets

- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
- `GOOGLE_CLOUD_REGION`: Your preferred GCP region
- `GCP_SA_KEY`: Google Cloud service account key (JSON)
- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account key
- `VERTEX_AI_ENDPOINT_ID`: Optional Vertex AI endpoint ID

#### API URLs

- `VITE_API_URL`: Frontend API URL
- `WEB_APP_URL`: Production web app URL
- `API_URL`: Production API URL

#### Security & Monitoring

- `SNYK_TOKEN`: Snyk security scanning token
- `SLACK_WEBHOOK_URL`: Slack webhook for notifications
- `EMAIL_NOTIFICATION_ENABLED`: Enable email notifications

### Environment Variables

The workflows use these environment variables:

- `NODE_VERSION`: '18'
- `PNPM_VERSION`: '8'

## 🚀 Usage

### Manual Workflow Triggers

1. **Deploy to Environment**:

   ```bash
   # Via GitHub UI: Actions > Deploy > Run workflow
   # Select environment: staging or production
   ```

2. **Update Dependencies**:

   ```bash
   # Via GitHub UI: Actions > Dependency Update > Run workflow
   ```

3. **Performance Test**:
   ```bash
   # Via GitHub UI: Actions > Performance Monitoring > Run workflow
   ```

### Release Process

1. **Create a new release**:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **The release workflow will**:
   - Generate changelog from conventional commits
   - Create GitHub release with notes
   - Build and upload release assets
   - Notify stakeholders

### Branch Protection

Recommended branch protection rules for `main`:

- Require status checks to pass
- Require branches to be up to date
- Require pull request reviews
- Restrict pushes to matching branches

## 📊 Monitoring & Notifications

### Slack Channels

- `#deployments`: Deployment status
- `#releases`: Release notifications
- `#security`: Security alerts
- `#performance`: Performance metrics
- `#devops`: General DevOps notifications

### Metrics Tracked

- Build success/failure rates
- Test coverage trends
- Security vulnerability counts
- Performance metrics (Lighthouse scores)
- Deployment frequency and success rates

## 🔒 Security Features

### Automated Security Checks

- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Advanced security analysis
- **CodeQL**: Static code analysis
- **Dependency Review**: PR dependency analysis

### Security Best Practices

- Automated dependency updates
- Security scanning on every PR
- Vulnerability alerts via Slack
- Regular security audits

## 📈 Performance Monitoring

### Metrics Collected

- **Lighthouse Scores**: Performance, Accessibility, Best Practices, SEO
- **Bundle Size**: JavaScript bundle analysis
- **API Response Times**: Backend performance
- **Load Testing**: Simulated user traffic

### Performance Targets

- Lighthouse Performance Score: > 90
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Bundle Size: < 500KB (gzipped)

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Deployment Failures**:
   - Verify Google Cloud credentials
   - Check Firebase project configuration
   - Ensure environment variables are set

3. **Test Failures**:
   - Review test logs for specific failures
   - Check for flaky tests
   - Verify test environment setup

### Debug Workflows

To debug workflow issues:

1. Enable debug logging in workflow runs
2. Check artifact uploads for build outputs
3. Review job dependencies and execution order
4. Verify secret configurations

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Functions Documentation](https://cloud.google.com/functions/docs)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [CodeQL Documentation](https://docs.github.com/en/code-security/codeql-cli)

## 🤝 Contributing

When adding new workflows:

1. Follow the existing naming conventions
2. Include proper error handling
3. Add appropriate notifications
4. Document any new secrets or environment variables
5. Test workflows in a feature branch first

## 📞 Support

For workflow issues or questions:

1. Check the workflow logs for specific errors
2. Review this documentation
3. Create an issue with the `ci/cd` label
4. Contact the DevOps team via Slack
