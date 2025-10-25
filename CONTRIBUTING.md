# Contributing to DeepFake Detector

## 🤝 Welcome Contributors!

Thank you for your interest in contributing to the DeepFake Detector project! This guide will help you get started.

## 🚀 Quick Start

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/DeepFakeDetector-webside.git
cd DeepFakeDetector-webside
```

### 2. Setup Development Environment
```bash
# Windows
SETUP.bat

# Manual setup
scripts\install.bat
scripts\setup-config.bat
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## 📋 Development Guidelines

### Code Style
- **Python**: Follow PEP 8 standards
- **JavaScript/React**: Use ESLint configuration
- **Comments**: Write clear, concise comments
- **Naming**: Use descriptive variable/function names

### Testing Requirements
- Add tests for new features
- Maintain >80% code coverage
- Run tests before submitting PR

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests  
cd frontend && npm test
```

### Commit Messages
Use conventional commit format:
```
feat: add new detection algorithm
fix: resolve authentication bug
docs: update API documentation
test: add unit tests for file upload
```

## 🎯 Areas for Contribution

### High Priority
- **New Detection Algorithms**: Improve accuracy
- **Performance Optimization**: Reduce processing time
- **UI/UX Improvements**: Enhance user experience
- **Documentation**: API docs, tutorials
- **Testing**: Increase test coverage

### Medium Priority
- **Mobile Responsiveness**: Better mobile support
- **Accessibility**: WCAG compliance
- **Internationalization**: Multi-language support
- **Analytics**: Usage tracking and insights

### Low Priority
- **Themes**: Additional UI themes
- **Integrations**: Third-party service integrations
- **Plugins**: Extensible architecture

## 🔧 Development Setup

### Backend Development
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app_new.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Full Stack Development
```bash
scripts\dev.bat  # Starts both backend and frontend
```

## 📝 Pull Request Process

### Before Submitting
1. **Test Locally**: Ensure all tests pass
2. **Code Review**: Self-review your changes
3. **Documentation**: Update relevant docs
4. **Changelog**: Add entry if significant change

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs
2. **Code Review**: Maintainer reviews code
3. **Testing**: Manual testing if needed
4. **Merge**: Approved PRs are merged

## 🐛 Bug Reports

### Before Reporting
1. **Search Issues**: Check if already reported
2. **Reproduce**: Confirm bug is reproducible
3. **Environment**: Note OS, browser, versions

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## 🏗️ Architecture Overview

### Backend Structure
```
backend/
├── models/          # Database models
├── routes/          # API endpoints
├── services/        # Business logic
├── middleware/      # Authentication, validation
├── detectors/       # ML detection algorithms
└── utils/           # Helper functions
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── context/        # React context
├── hooks/          # Custom hooks
└── utils/          # Helper functions
```

## 🔒 Security Guidelines

### Sensitive Data
- Never commit API keys or passwords
- Use environment variables for secrets
- Follow OWASP security practices

### Code Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement proper authentication

## 📚 Resources

### Documentation
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Setup Guide](SETUP_GUIDE.md)

### Learning Resources
- [React Documentation](https://reactjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Invited to maintainer team (for significant contributions)

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Email**: For security issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy Contributing! 🚀**