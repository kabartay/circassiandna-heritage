#!/bin/bash

# Upload Heritage Data to GCP Cloud Storage
# Usage: ./scripts/upload-to-gcp.sh

set -e

# Configuration
BUCKET_NAME="${GCP_BUCKET_NAME:-circassiandna-heritage-data}"
PROJECT_ID="${GCP_PROJECT_ID}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Uploading Heritage Data to GCP...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Install it from: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}❌ Not authenticated. Run: gcloud auth login${NC}"
    exit 1
fi

# Set project if provided
if [ -n "$PROJECT_ID" ]; then
    gcloud config set project "$PROJECT_ID"
fi

# Check if bucket exists, create if not
if ! gsutil ls "gs://${BUCKET_NAME}" &> /dev/null; then
    echo -e "${BLUE}📦 Creating bucket: ${BUCKET_NAME}${NC}"
    gsutil mb -l us-central1 "gs://${BUCKET_NAME}"
    
    # Make bucket private
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}" -d
    echo -e "${GREEN}✅ Bucket created and set to private${NC}"
else
    echo -e "${GREEN}✅ Bucket exists: ${BUCKET_NAME}${NC}"
fi

# Upload data files
echo -e "${BLUE}📤 Uploading data files...${NC}"

if [ -f "data/heritage-data.json" ]; then
    gsutil cp data/heritage-data.json "gs://${BUCKET_NAME}/heritage-data.json"
    echo -e "${GREEN}✅ Uploaded heritage-data.json${NC}"
else
    echo -e "${RED}❌ data/heritage-data.json not found${NC}"
    exit 1
fi

if [ -f "data/config.json" ]; then
    gsutil cp data/config.json "gs://${BUCKET_NAME}/config.json"
    echo -e "${GREEN}✅ Uploaded config.json${NC}"
else
    echo -e "${RED}❌ data/config.json not found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Upload complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Create a service account for GitHub Actions:"
echo "   gcloud iam service-accounts create github-actions-deployer --display-name='GitHub Actions Deployer'"
echo ""
echo "2. Grant storage viewer permission:"
echo "   gcloud projects add-iam-policy-binding \$PROJECT_ID \\"
echo "     --member='serviceAccount:github-actions-deployer@\${PROJECT_ID}.iam.gserviceaccount.com' \\"
echo "     --role='roles/storage.objectViewer'"
echo ""
echo "3. Create and download key:"
echo "   gcloud iam service-accounts keys create key.json \\"
echo "     --iam-account=github-actions-deployer@\${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
echo "4. Add to GitHub Secrets:"
echo "   - GCP_SA_KEY: (content of key.json)"
echo "   - GCP_BUCKET_NAME: ${BUCKET_NAME}"
echo ""
echo "5. Delete local key: rm key.json"
