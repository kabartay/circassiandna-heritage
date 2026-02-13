# Setting Up GitHub Secrets for Private Data

Your sensitive DNA heritage data is now protected from public view. Follow these steps to configure GitHub Secrets:

## 1. Encode Your Data Files

The data files have been base64 encoded. You can find them at:
- `/tmp/heritage-data-base64.txt` - Your heritage data
- Encode config.json: `base64 -i data/config.json | tr -d '\n'`

## 2. Add Secrets to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

### Secret 1: HERITAGE_DATA
- **Name:** `HERITAGE_DATA`
- **Value:** Copy the entire content from `/tmp/heritage-data-base64.txt`

### Secret 2: CONFIG_DATA
- **Name:** `CONFIG_DATA`
- **Value:** Run `base64 -i data/config.json | tr -d '\n'` and paste the output

## 3. How It Works

- Your data files (`data/heritage-data.json` and `data/config.json`) are now in `.gitignore`
- They won't be committed to your public repository
- During GitHub Actions deployment, the workflow decodes the secrets and creates the data files
- The site deploys with data intact, but the source stays private

## 4. Local Development

Keep your original data files locally for development:
- `data/heritage-data.json` (ignored by git)
- `data/config.json` (ignored by git)

You can work normally - git will ignore these files.

## 5. Update Data

When you need to update data:
1. Edit your local files
2. Re-encode them: `base64 -i data/heritage-data.json | tr -d '\n'`
3. Update the GitHub Secret with the new encoded value
4. Push any code changes (data is already in secrets)

## 6. Verify Setup

After setting up secrets:
1. Make a small commit and push to `main` or `feat/basis`
2. Check the Actions tab on GitHub
3. Verify the "Inject Heritage Data from Secrets" step succeeds
4. Visit your deployed site to confirm data loads correctly

---

**Note:** Your data is now secure! The encoded base64 strings are in `/tmp/` and will be cleared when you restart your Mac.
