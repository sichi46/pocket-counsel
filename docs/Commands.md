===========================
 GIT SHORTCUTS & COMMANDS
===========================

⚙️ INITIAL SETUP
---------------------------
git init                            # Initialize a new Git repository
git clone <repo-url>               # Clone a remote repo to your local machine
git remote add origin <url>        # Add remote repository
git remote -v                      # View configured remotes
git remote set-url origin <url>    # Change the remote URL

🌿 BRANCHING
---------------------------
git branch                         # List all local branches
git branch <branch-name>          # Create a new branch
git checkout <branch-name>        # Switch to another branch
git checkout -b <branch-name>     # Create AND switch to a new branch
git fetch origin                  # Download latest branches from remote
git pull origin <branch>          # Pull latest changes from remote branch
git push -u origin <branch>       # Push branch to remote and set upstream
git push -u origin <branch> --force  # Force push to remote (overwrite)

📦 STAGING & COMMITTING
---------------------------
git status                         # Show file changes
git add .                          # Stage all changes
git add <filename>                # Stage specific file
git commit -m "message"           # Commit staged changes
git log                           # View commit history

🚀 PUSHING & PULLING
---------------------------
git push                           # Push committed changes
git pull                           # Pull latest changes
git push origin <branch>          # Push to specific branch
git push --set-upstream origin <branch>  # Set the upstream branch
git push --force                  # Force push to overwrite remote

🗑️ DELETING FILES & FOLDERS
---------------------------
git rm -r <folder-name>           # Remove folder from Git tracking
git commit -m "Remove folder"     # Commit the deletion
git push                          # Push the updated repo to GitHub

🔐 AUTHENTICATION
---------------------------
gh auth login                     # Login to GitHub using GitHub CLI
git config --global user.name "Your Name"           # Set your Git username
git config --global user.email "you@example.com"    # Set your Git email

🔍 CHECKING REPO INFO
---------------------------
git config --get remote.origin.url   # See the remote URL
git branch -a                        # Show all local and remote branches
git rev-parse --abbrev-ref HEAD      # Show current branch name


firebase
firebase init

dev
pnpm run build
pnpm exec firebase deploy --only hosting

staging
pnpm run build:staging

run backend server
pnpm run server

npm run dev:emulator 