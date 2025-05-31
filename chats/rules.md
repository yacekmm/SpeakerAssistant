# Project Rules

## Git Commit Messages
- Use the exact prompt as the commit message
- Include the full prompt, not just a summary
- Format: Use the exact wording provided by the user

## Testing
- Always include tests for the codebase
- Focus on quality and readability over coverage
- Do not test getters and setters
- Follow testing patterns from [Tickets repository](https://github.com/yacekmm/Tickets)
- Avoid mocks where responsible
- Avoid duplication
- Run and fix tests after each change
- Include GitHub Workflow for CI to run tests after each push

## Documentation
- Keep README.md up to date with:
  - Project description
  - Features
  - Technical requirements
  - Architecture
  - Setup instructions
  - Development status
  - Getting started guide
  - Project structure

## Chat Log
- Maintain conversation history in `chats/cursor.md`
- Document all significant changes and decisions
- Include implementation details and explanations

## Rules Management
- Update this file whenever a new rule is set or an existing rule is changed
- Document the date and context of rule changes
- Keep rules organized by category
- Ensure all team members are aware of rule changes 