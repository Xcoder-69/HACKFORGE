# 🚀 HACKFORGE

Welcome to **HACKFORGE**! This repository is configured for team collaboration with dedicated member branches.

---

## 👥 Team Members & Branches

| Member | Dedicated Branch | Role / Focus |
|---|---|---|
| **Pranav** | [`pranav`](#) | Feature Development |
| **Darshil** | [`darshil`](#) | Feature Development |
| **Mahendra** | [`mahendra`](#) | Feature Development & Integration |
| **Chetan** | [`chetan`](#) | Feature Development |
| **Production / Stable** | [`main`](#) | Stable Releases / Integrated Code |

---

## 📌 Branching Rules & Workflow

> [!IMPORTANT]
> **Rule #1: NEVER push directly to `main`.**  
> Every member must only push commits to their assigned branch.  
> Code is reviewed and merged into `main` after testing and approval.

### Quick Workflow Guide

1. **Switch to your branch before starting work:**
   ```bash
   git checkout <your-branch-name>
   git pull origin <your-branch-name>
   ```

2. **Work on your code, commit, and push:**
   ```bash
   git add .
   git commit -m "feat: description of work done"
   git push origin <your-branch-name>
   ```

3. **Merging to `main`:**
   - Create a Pull Request (PR) on GitHub from your branch to `main`.
   - Once reviewed and verified, merge into `main`.
   - Update your local branch with the latest `main`:
     ```bash
     git checkout main
     git pull origin main
     git checkout <your-branch-name>
     git merge main
     ```

For detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).
