# Sidra — Documentation Missing Information Log

This file records items that could not be verified from the source code and must be completed manually before final submission.

---

## 1. Team Member Full Names and Student IDs

**What is needed:** Full legal names, student registration numbers, department, and course name for the cover page.

**Current state:** Team members are referred to as "Beimenet" and "Amanuel" in the README. Last names and IDs were not available in the repository.

**Action required:** Supply full names, student IDs, department name, and academic year for the cover page.

---

## 2. University / Institution Name

**What is needed:** The name of the university or institution for the cover page and headers.

**Current state:** Not present in the repository.

**Action required:** Add your university name and department.

---

## 3. Supervisor / Instructor Name

**What is needed:** Name(s) of the project supervisor or course instructor for the acknowledgment and cover page.

**Current state:** Not present in the repository.

**Action required:** Add supervisor name and title.

---

## 4. Screenshots and UI Images

**What is needed:** Actual screenshots of the running application for Chapter 4 (UI Design).

**Current state:** The documentation describes each page in detail but does not include embedded images.

**Action required:** 
- Run `cd client && npm run dev` 
- Take screenshots of: Homepage, Courses page, Login, Register, Profile, Admin Dashboard (overview, users, professionals)
- Insert images into the Markdown source with captions

---

## 5. GitHub Repository URL

**What is needed:** The public or institutional GitHub repository link for the References section and Appendix.

**Current state:** README says "GitHub repository" but no URL is present.

**Action required:** Add the actual repository URL.

---

## 6. Courses.test.js Results

**What is needed:** Verification that the `tests/courses.test.js` suite passes.

**Current state:** The test suite exists (`package.json` includes `test:courses`) but was not executed during this documentation analysis. The three other test suites (auth, profile, admin) are confirmed at 157/157.

**Action required:** Run `npm run test:courses` and record results. Add to Appendix D.

---

## 7. Actual Deployment URL (if applicable)

**What is needed:** If the application has been deployed (e.g., to Vercel, Render, or a VPS), the live URL should be added to Chapter 7 and the cover page.

**Current state:** No deployment URL exists as of this documentation.

**Action required:** Add once deployed, or confirm "not yet deployed" for submission.

---

## 8. Amanuel's Implemented Routes Confirmation

**What is needed:** Confirmed implementation status of the course, enrollment, lesson progress, and professional directory endpoints that Amanuel is responsible for.

**Current state:** The `server/src/app.js` comment and root endpoint note suggest these are now implemented, but the routes were not read in full during this analysis.

**Action required:** Check `server/src/routes/courses.js` and `server/src/routes/professionals.js` to confirm which endpoints are real (200) vs. stubs (501), and update Table 3.2 accordingly.

---

## 9. Exact Git Contribution Statistics

**What is needed:** Commit counts, lines changed, and dates per team member for Chapter 8.

**Current state:** Collaboration details are described based on README and known task division, not from reading the full Git log.

**Action required:** Run `git log --oneline --author="Beimenet"` and `git log --oneline --author="Amanuel"` to get accurate counts.

---

## 10. PDF Generation

**What is needed:** The actual PDF file `Sidra_Project_Documentation.pdf`.

**Current state:** Direct PDF generation was not available in this environment. The complete Markdown source (`Sidra_Project_Documentation.md`) has been created.

**Action required — choose one method:**

**Option A — Pandoc (recommended):**
```bash
# Install Pandoc: https://pandoc.org/installing.html
# Install a PDF engine: https://wkhtmltopdf.org/ or install TeX Live

pandoc "Sidra_Project_Documentation.md" \
  -o "Sidra_Project_Documentation.pdf" \
  --pdf-engine=wkhtmltopdf \
  -V geometry:margin=2.5cm \
  -V fontsize=11pt \
  --toc \
  --number-sections
```

**Option B — VS Code extension:**
- Install "Markdown PDF" extension by yzane in VS Code
- Open `Sidra_Project_Documentation.md`
- Right-click → "Markdown PDF: Export (pdf)"

**Option C — Browser print:**
- Open the Markdown file in a Markdown previewer or convert to HTML first
- Print → Save as PDF → A4, margins: 2cm

**Option D — Word/Google Docs:**
- Copy the Markdown content into Google Docs or Word
- Apply heading styles, add page numbers
- Export as PDF

---

*This log was generated automatically during documentation analysis. Items marked above do not affect the technical accuracy of the main documentation — they are administrative or visual additions required for academic submission.*
