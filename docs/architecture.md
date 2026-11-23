# HISTORY 12 - SYSTEM ARCHITECTURE

Version: 1.0
Project: History-12
Status: Initial Specification
Owner: Project Manager

---

## 1. PROJECT OVERVIEW

History-12 is a free, non-profit educational website for Grade 12 History students.

The website provides:
- Historical timeline from 1914 to 2024.
- Visual historical learning.
- Basic and advanced learning modes.
- Historical question bank.
- Randomized practice exams.
- Exam results and answer explanations.

The first MVP focuses on the period 1945-1954.

The website must be easy to maintain and transfer to future student teams.

---

## 2. TECHNOLOGY STACK

The approved technology stack:

- HTML5
- CSS3
- Vanilla JavaScript ES6+
- JSON
- LocalStorage
- Git
- GitHub Pages

The following technologies are NOT approved:

- React
- Vue
- Angular
- Backend server
- Database server
- Node.js-based application frameworks
- Unapproved third-party frameworks or libraries

Any change to the technology stack requires approval from the Project Manager.

---

## 3. PROJECT DIRECTORY STRUCTURE

The approved directory structure:

History-12/
|
|-- index.html
|-- README.md
|-- .gitignore
|
|-- assets/
|   |-- images/
|   |-- icons/
|
|-- css/
|   |-- style.css
|   |-- timeline.css
|   |-- responsive.css
|
|-- js/
|   |-- app.js
|   |-- timeline.js
|   |-- learning.js
|   |-- quiz.js
|   |-- storage.js
|
|-- data/
|   |-- events.json
|   |-- questions.json
|   |-- exam-blueprints.json
|
|-- docs/
|   |-- architecture.md
|   |-- content-guidelines.md
|   |-- handover.md
|
|-- Local_Project_docs/
    |-- AI_CODING_RULES.MD

Do not create additional root-level directories without approval.

---

## 4. SYSTEM MODULES

### 4.1 Application Core

File: js/app.js

Responsibilities:
- Initialize the application.
- Coordinate major modules.
- Handle navigation between main sections.
- Initialize shared application state when required.

### 4.2 Historical Timeline

File: js/timeline.js

Responsibilities:
- Load historical events from data/events.json.
- Display World History and Vietnam History in two separate lanes.
- Sort events chronologically.
- Display event details.
- Support basic filtering.
- Provide links from events to learning content.

Desktop:
- Horizontal timeline.

Mobile:
- Vertical list or event cards.

Do not force landscape orientation.
Do not hijack normal page scrolling.

### 4.3 Learning System

File: js/learning.js

Responsibilities:
- Display historical learning content.
- Support Basic and Advanced learning modes.
- Display event images.
- Display mindmaps when data is available.
- Display historical context, causes, developments and consequences.
- Display references and sources.

### 4.4 Question Bank

File: data/questions.json

The question bank stores structured questions.

Questions must include:
- Unique ID.
- Question content.
- Answer options when applicable.
- Correct answer.
- Explanation.
- Topic.
- Historical period.
- Difficulty.
- Question type.
- timelineRef.
- Publication status.

### 4.5 Assessment Engine

File: js/quiz.js

Responsibilities:
- Generate practice exams from exam-blueprints.json.
- Randomize eligible questions.
- Avoid duplicate questions in one exam.
- Store answers during the exam.
- Support optional timer.
- Calculate results.
- Submit the exam only once.
- Display explanations after submission.

If the question bank does not contain enough eligible questions, the system must show an appropriate warning instead of generating an invalid exam.

### 4.6 Local Storage

File: js/storage.js

Responsibilities:
- Save learning progress.
- Save appropriate local user preferences.
- Save practice history when required.
- Handle missing or invalid stored data safely.

Do not store sensitive personal information.

---

## 5. DATA-DRIVEN ARCHITECTURE

Historical content must be separated from application logic.

The website must load content from JSON files.

Main data files:

- data/events.json
- data/questions.json
- data/exam-blueprints.json

Do not hardcode historical events, questions, correct answers or exam blueprints directly into JavaScript.

The application must not invent historical information when data is missing.

Only content approved for publication may be displayed to learners.

---

## 6. EVENT AND QUESTION RELATIONSHIP

Each question may contain a timelineRef field.

timelineRef connects a question to a historical event.

When a learner answers incorrectly, the result page should provide a way to revisit the related historical event.

If timelineRef is missing or invalid, the application must handle it safely.

---

## 7. USER INTERFACE REQUIREMENTS

The website must provide:

- Clear navigation.
- Readable typography.
- Consistent visual design.
- Responsive layout.
- Clear distinction between Basic and Advanced learning.
- Accessible controls and understandable feedback.

Do not add animations or decorative effects that reduce usability.

Do not create features that are not specified in the approved project scope.

---

## 8. RESPONSIVE REQUIREMENTS

Desktop:
- Two-lane historical timeline.
- Appropriate content width.
- Clear navigation.

Mobile:
- Vertical timeline or event cards.
- No horizontal overflow on normal content.
- Buttons and controls must be usable on touch screens.
- Text must remain readable.

Test at least one desktop viewport and one mobile viewport.

---

## 9. ERROR HANDLING

The application must handle:

- JSON loading errors.
- Missing data.
- Invalid question references.
- Invalid timeline references.
- Empty question banks.
- Insufficient questions for an exam.
- LocalStorage errors.

Do not silently hide important errors.
Do not display fake success messages.

---

## 10. MVP SCOPE

The first MVP covers historical content from 1945 to 1954.

Required features:

1. Two-lane historical timeline.
2. Event detail display.
3. Basic learning mode.
4. Advanced learning mode.
5. Historical images when approved assets are available.
6. Question bank.
7. Randomized practice exam.
8. Scoring and explanations.
9. Links from incorrect answers to related timeline events.
10. Responsive interface.

Complex animations and advanced mindmap interactions are lower priority.

---

## 11. DEPLOYMENT

The approved deployment platform is GitHub Pages.

The website must:
- Work as a static website.
- Use correct relative paths.
- Load JSON files correctly.
- Avoid backend dependencies.
- Work after deployment, not only on a local development environment.

Do not claim deployment is successful until the published website has been tested.

---

## 12. CHANGE CONTROL

The Project Manager has final authority over:

- Architecture.
- Technology stack.
- Directory structure.
- Data schema.
- Feature scope.
- UI direction.
- Acceptance criteria.

The Developer must request approval before changing any of these.

Any proposed technical change must include:
1. Current limitation.
2. Proposed change.
3. Reason.
4. Impact on existing modules.
5. Estimated additional time.

---

## 13. FINAL PRINCIPLE

Build only what is specified and approved.

Do not invent requirements.
Do not silently change architecture.
Do not sacrifice historical accuracy for development speed.
