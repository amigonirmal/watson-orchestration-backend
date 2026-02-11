# Git Repository Setup Guide

This guide explains how to push the Watson Orchestration Backend project to a new Git repository.

## Prerequisites

- Git installed on your system
- GitHub/GitLab/Bitbucket account
- SSH keys configured (recommended) or HTTPS credentials

## Step 1: Create a New Repository

### On GitHub:
1. Go to https://github.com/new
2. Repository name: `watson-orchestration-backend` (or your preferred name)
3. Description: "Backend API for WatsonX Orchestrate integration with YFS Statistics"
4. Choose: **Private** (recommended for enterprise projects)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### On GitLab:
1. Go to https://gitlab.com/projects/new
2. Project name: `watson-orchestration-backend`
3. Visibility: **Private**
4. Uncheck "Initialize repository with a README"
5. Click "Create project"

### On Bitbucket:
1. Go to https://bitbucket.org/repo/create
2. Project name: `watson-orchestration-backend`
3. Access level: **Private**
4. Click "Create repository"

## Step 2: Initialize Local Git Repository

Open terminal in your project directory and run:

```bash
# Navigate to project root
cd c:/Users/NirmalRamesan/Downloads/Nirmal/WatsonX/watson-orchestration-agent/watson-orchestration-agent

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Watson Orchestration Backend API

- Backend API with Express.js
- PostgreSQL database integration
- Swagger/OpenAPI documentation
- Filter and comparison endpoints
- GCP Cloud Run deployment ready
- Comprehensive testing suite"
```

## Step 3: Connect to Remote Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:

### Using SSH (Recommended):

```bash
# GitHub
git remote add origin git@github.com:YOUR_USERNAME/watson-orchestration-backend.git

# GitLab
git remote add origin git@gitlab.com:YOUR_USERNAME/watson-orchestration-backend.git

# Bitbucket
git remote add origin git@bitbucket.org:YOUR_USERNAME/watson-orchestration-backend.git
```

### Using HTTPS:

```bash
# GitHub
git remote add origin https://github.com/YOUR_USERNAME/watson-orchestration-backend.git

# GitLab
git remote add origin https://gitlab.com/YOUR_USERNAME/watson-orchestration-backend.git

# Bitbucket
git remote add origin https://bitbucket.org/YOUR_USERNAME/watson-orchestration-backend.git
```

## Step 4: Push to Remote Repository

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

If you encounter authentication issues:
```bash
# For HTTPS, you may need to configure credentials
git config --global credential.helper store

# For SSH, ensure your SSH key is added to your Git provider
ssh -T git@github.com  # Test GitHub connection
```

## Step 5: Verify Upload

1. Go to your repository URL in a browser
2. Verify all files are present
3. Check that `.env` files are **NOT** uploaded (they should be in `.gitignore`)

## Step 6: Set Up Branch Protection (Recommended)

### On GitHub:
1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Include administrators

### On GitLab:
1. Go to Settings → Repository → Protected Branches
2. Protect `main` branch
3. Set "Allowed to merge" and "Allowed to push"

## Step 7: Add Collaborators (Optional)

### On GitHub:
1. Settings → Collaborators
2. Add team members by username/email

### On GitLab:
1. Project → Members
2. Invite members with appropriate roles

## Project Structure in Repository

```
watson-orchestration-backend/
├── .gitignore                          # Git ignore rules
├── README.md                           # Project documentation
├── deploy-to-gcp.sh                    # GCP deployment script
├── backend/                            # Backend application
│   ├── .dockerignore                   # Docker ignore rules
│   ├── .env.example                    # Environment template
│   ├── Dockerfile                      # Docker configuration
│   ├── package.json                    # Node.js dependencies
│   ├── swagger.json                    # API documentation
│   └── src/                            # Source code
│       ├── server.js                   # Main server file
│       ├── database/                   # Database layer
│       ├── middleware/                 # Express middleware
│       ├── routes/                     # API routes
│       ├── services/                   # Business logic
│       └── utils/                      # Utility functions
├── database/                           # Database schemas
│   ├── yfs_statistics_detail_schema.sql
│   └── sample_queries.sql
├── docs/                               # Documentation
│   ├── API_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── FILTER_PARAMETERS.md
│   ├── GCP_CLOUD_RUN_DEPLOYMENT.md
│   ├── GIT_REPOSITORY_SETUP.md
│   └── LOCAL_TESTING_GUIDE.md
├── deployment/                         # Deployment configs
│   └── docker-compose.yml
└── test-*.js                           # Test scripts
```

## Best Practices

### 1. Never Commit Sensitive Data
✅ Use `.env.example` for templates
✅ Store secrets in environment variables
✅ Use Git secrets scanning tools
❌ Never commit `.env` files
❌ Never commit API keys or passwords

### 2. Write Meaningful Commit Messages
```bash
# Good commit messages
git commit -m "feat: Add hourly aggregation to comparison API"
git commit -m "fix: Resolve database connection timeout issue"
git commit -m "docs: Update GCP deployment guide"

# Use conventional commits format
# type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

### 3. Use Branches for Features
```bash
# Create feature branch
git checkout -b feature/add-authentication

# Make changes and commit
git add .
git commit -m "feat: Add JWT authentication"

# Push feature branch
git push origin feature/add-authentication

# Create pull request on GitHub/GitLab
```

### 4. Keep Repository Clean
```bash
# Remove untracked files
git clean -fd

# Remove files from git but keep locally
git rm --cached filename

# Update .gitignore and remove cached files
git rm -r --cached .
git add .
git commit -m "chore: Update .gitignore"
```

## Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline --graph

# Create and switch to new branch
git checkout -b branch-name

# Switch branches
git checkout main

# Pull latest changes
git pull origin main

# Merge branch
git merge feature-branch

# Tag a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

## Setting Up CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: watson-backend
          region: us-central1
          source: ./backend
```

### GitLab CI

Create `.gitlab-ci.yml`:
```yaml
stages:
  - test
  - deploy

test:
  stage: test
  image: node:18
  script:
    - cd backend
    - npm ci
    - npm test

deploy:
  stage: deploy
  image: google/cloud-sdk:alpine
  only:
    - main
  script:
    - gcloud run deploy watson-backend --source ./backend
```

## Troubleshooting

### Issue: Large files rejected
```bash
# Remove large files from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large/file' \
  --prune-empty --tag-name-filter cat -- --all
```

### Issue: Wrong remote URL
```bash
# Check current remote
git remote -v

# Change remote URL
git remote set-url origin NEW_URL
```

### Issue: Merge conflicts
```bash
# View conflicts
git status

# Edit conflicted files, then:
git add .
git commit -m "fix: Resolve merge conflicts"
```

## Security Checklist

Before pushing to repository:

- [ ] `.env` files are in `.gitignore`
- [ ] No API keys in code
- [ ] No database passwords in code
- [ ] No sensitive data in commit history
- [ ] `.env.example` has placeholder values only
- [ ] Secrets are documented in README
- [ ] Repository is set to Private
- [ ] Branch protection is enabled
- [ ] Two-factor authentication is enabled on Git account

## Next Steps

1. ✅ Push code to repository
2. Set up branch protection rules
3. Add collaborators
4. Configure CI/CD pipeline
5. Set up automated deployments
6. Create release tags
7. Write contributing guidelines
8. Set up issue templates

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [GitLab Documentation](https://docs.gitlab.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)

## Support

For Git-related issues:
- GitHub: https://support.github.com/
- GitLab: https://about.gitlab.com/support/
- Git: https://git-scm.com/community