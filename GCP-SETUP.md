# GCP Cloud Storage Setup for Heritage Data

This setup allows you to store large DNA heritage data in Google Cloud Platform (GCP) Cloud Storage, keeping it private while still deploying to GitHub Pages.

## Benefits

- ✅ **No size limits** - Store gigabytes of data
- ✅ **Private & secure** - Data not in public repository
- ✅ **Easy updates** - Upload new data without changing code
- ✅ **Fast deployment** - Fetched during build time
- ✅ **Scalable** - GCP handles the heavy lifting

## Prerequisites

1. **GCP Account** - Create at [cloud.google.com](https://cloud.google.com)
2. **gcloud CLI** - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
3. **Project** - Create a GCP project or use existing

## Setup Steps

### 1. Install and Configure gcloud CLI

```bash
# Install (macOS)
brew install --cask google-cloud-sdk

# Initialize and authenticate
gcloud init
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Upload Data to GCP

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"
export GCP_BUCKET_NAME="circassiandna-heritage-data"

# Make script executable
chmod +x scripts/upload-to-gcp.sh

# Upload data
./scripts/upload-to-gcp.sh
```

This will:
- Create a private GCP bucket
- Upload your `heritage-data.json` and `config.json`
- Keep files private (not publicly accessible)

### 3. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant read-only access to storage
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-deployer@${GCP_PROJECT_ID}.iam.gserviceaccount.com

# View key (you'll copy this to GitHub)
cat key.json
```

### 4. Add GitHub Secrets

Go to: `https://github.com/[your-username]/circassiandna-heritage/settings/secrets/actions`

Add these secrets:

**Secret 1: GCP_SA_KEY**
- Name: `GCP_SA_KEY`
- Value: Entire content of `key.json` file

**Secret 2: GCP_BUCKET_NAME**
- Name: `GCP_BUCKET_NAME`
- Value: `circassiandna-heritage-data` (or your custom bucket name)

### 5. Update Workflow File

Rename the workflow to use GCP:

```bash
# Disable old workflow
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.backup

# Enable GCP workflow
mv .github/workflows/deploy-gcp.yml .github/workflows/deploy.yml
```

Or manually update your workflow to use the GCP fetch steps.

### 6. Clean Up

```bash
# Delete local service account key
rm key.json

# Commit changes
git add .github/workflows/
git commit -m "Switch to GCP Cloud Storage for data"
git push
```

## Updating Data

Whenever you need to update your heritage data:

```bash
# Edit your local files
# data/heritage-data.json
# data/config.json

# Upload to GCP
./scripts/upload-to-gcp.sh

# No need to commit data files!
# Just push code changes if any
git push
```

The next deployment will automatically fetch the updated data from GCP.

## Costs

- **Storage**: ~$0.02/GB/month for standard storage
- **Operations**: ~$0.004 per 10,000 read operations
- **Transfer**: First 1GB free per month

For most heritage projects, this will cost less than $1/month.

## Security Notes

- ✅ Bucket is private by default
- ✅ Service account has minimal permissions (read-only)
- ✅ Data encrypted at rest by GCP
- ✅ Access logged in GCP audit logs
- ⚠️ Never commit `key.json` to git

## Troubleshooting

**"Permission denied" during upload:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

**"Bucket already exists" error:**
- Use a different bucket name (must be globally unique)

**GitHub Actions fails to fetch:**
- Verify `GCP_SA_KEY` secret is correct JSON
- Check service account has `storage.objectViewer` role

## Alternative: Client-Side Fetching

If you prefer to fetch data at runtime in the browser:

1. Make bucket publicly readable for specific files
2. Enable CORS on the bucket
3. Fetch from JavaScript using `fetch()` API

This exposes data URLs but may be acceptable for your use case.

---

Need help? Check [GCP Storage documentation](https://cloud.google.com/storage/docs)
