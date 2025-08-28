# Auggie CLI Setup and Usage Guide

This repository is configured to work with Auggie CLI for AI-powered development assistance.

## Prerequisites

- Auggie CLI installed and authenticated
- GitHub repository access
- GitHub Actions enabled

## Authentication

You're already authenticated with Auggie. Your token is:
```
TOKEN={"accessToken":"9310db4b703146de66921ceb470039a8f15010c374f860b75a16dac831be7463","tenantURL":"https://d0.api.augmentcode.com/","scopes":["read","write"]}
```

## Usage Examples

### Basic Commands

```bash
# Analyze code and get suggestions
auggie --print "Review this code for potential improvements" < src/file.js

# Generate documentation
auggie --print "Generate comprehensive documentation for this code" < src/file.js

# Debug issues
cat error.log | auggie --print "Analyze this error and suggest fixes"

# Code review
git diff | auggie --print "Review these changes and provide feedback"
```

### Using with Environment Variables

```bash
# Set your token as environment variable
export AUGMENT_SESSION_AUTH='{"accessToken":"9310db4b703146de66921ceb470039a8f15010c374f860b75a16dac831be7463","tenantURL":"https://d0.api.augmentcode.com/","scopes":["read","write"]}'

# Then use auggie commands
auggie --print "Your instruction here"
```

### GitHub Integration

This repository includes GitHub Actions workflows that automatically:

1. **PR Description Generation** (`.github/workflows/pr-description.yml`)
   - Automatically generates comprehensive PR descriptions
   - Triggered on PR creation and updates

2. **PR Review** (`.github/workflows/pr-review.yml`)
   - Provides automated code review comments
   - Analyzes code quality, security, and performance

## GitHub Secrets Setup

To enable GitHub Actions workflows, add these secrets to your repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:

### Required Secrets

- `AUGMENT_SESSION_AUTH`: Your Auggie authentication token
  ```
  {"accessToken":"9310db4b703146de66921ceb470039a8f15010c374f860b75a16dac831be7463","tenantURL":"https://d0.api.augmentcode.com/","scopes":["read","write"]}
  ```

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions (no setup needed)

## Advanced Usage

### Custom Workflows

You can create custom workflows using Auggie. Example:

```yaml
- name: Custom Analysis
  run: |
    auggie --print "Analyze this codebase for security vulnerabilities" < security-scan.txt
```

### Local Development

```bash
# Analyze build failures
npm run build 2>&1 | auggie --print "Analyze this build failure and suggest fixes"

# Code generation
auggie --print "Generate a React component for user authentication"

# Test generation
auggie --print "Generate unit tests for this function" < src/utils.js
```

## Tips

1. Be specific in your instructions to get better results
2. Provide context when analyzing code
3. Use Auggie for code reviews, documentation, debugging, and generation
4. Combine with other tools in your development pipeline

## Troubleshooting

If you encounter issues:

1. Verify your authentication: `auggie tokens print`
2. Check your token hasn't expired
3. Ensure GitHub Actions have proper permissions
4. Review workflow logs in GitHub Actions tab

For more information, visit the [Auggie documentation](https://docs.augmentcode.com).