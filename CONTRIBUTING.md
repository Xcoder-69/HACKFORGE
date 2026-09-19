# 🤝 Team Collaboration Guidelines

This document outlines the branch rules and Git workflow for **HACKFORGE**.

---

## 🌳 Branch Hierarchy

- **`main`**: Protected branch. Contains stable, working, production-ready code. No direct pushes allowed.
- **`pranav`**: Active development branch for Pranav.
- **`darshil`**: Active development branch for Darshil.
- **`mahendra`**: Active development branch for Mahendra.
- **`chetan`**: Active development branch for Chetan.

---

## 🛠️ Step-by-Step Developer Guide

### 1. Initial Setup (Clone the repo)
```bash
git clone https://github.com/Xcoder-69/HACKFORGE.git
cd HACKFORGE
```

### 2. Switch to Your Personal Branch
For example, if your name is **Pranav**:
```bash
git checkout pranav
```
*(Replace `pranav` with `darshil`, `mahendra`, or `chetan` depending on who you are)*

### 3. Daily Workflow
Before starting work each day:
```bash
# Get the latest changes on main
git checkout main
git pull origin main

# Switch back to your branch and sync with main
git checkout <your-branch>
git merge main
```

### 4. Saving & Pushing Your Changes
Stage your changes, commit them with a meaningful message, and push to **your branch only**:
```bash
git add .
git commit -m "feat: added new module"
git push origin <your-branch>
```

> [!CAUTION]
> **DO NOT RUN:** `git push origin main`  
> Direct pushes to `main` can overwrite teammates' work and cause merge conflicts.

---

## 🚀 How to Merge Into `main`

When a feature or task is ready to be included in the main project:

1. **Push your branch to GitHub**:
   ```bash
   git push origin <your-branch>
   ```
2. **Go to GitHub Repo**: Open `https://github.com/Xcoder-69/HACKFORGE` in your browser.
3. **Open Pull Request (PR)**:
   - Click **New Pull Request**.
   - Base branch: `main`
   - Compare branch: `<your-branch>`
4. **Review & Merge**:
   - Review changes with team members.
   - Click **Merge Pull Request** once approved!
