import os
import sys
import urllib.request
import zipfile
import json
import csv
import time

TARGET_DIR = r"e:\Programs\Self_Projects\patient-diagnosis-system\backend\data\ddxplus\raw"
os.makedirs(TARGET_DIR, exist_ok=True)

FILES = {
    "release_conditions.json": "https://ndownloader.figshare.com/files/62561569",
    "release_evidences.json": "https://ndownloader.figshare.com/files/40278013",
    "release_test_patients.zip": "https://ndownloader.figshare.com/files/40278016",
    "release_validate_patients.zip": "https://ndownloader.figshare.com/files/40278022",
    "release_train_patients.zip": "https://ndownloader.figshare.com/files/40278019"
}

def download_file(url, target_path):
    print(f"Downloading {os.path.basename(target_path)} from {url}...")
    def reporthook(count, block_size, total_size):
        if total_size > 0:
            percent = int(count * block_size * 100 / total_size)
            if count % 200 == 0 or percent >= 100:
                print(f"  Progress: {percent}% ({count * block_size}/{total_size} bytes)", end="\r")
    
    urllib.request.urlretrieve(url, target_path, reporthook=reporthook)
    print(f"\nCompleted {os.path.basename(target_path)} ({os.path.getsize(target_path)} bytes)")

for fname, url in FILES.items():
    dest = os.path.join(TARGET_DIR, fname)
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        download_file(url, dest)
    else:
        print(f"Already downloaded: {fname} ({os.path.getsize(dest)} bytes)")

# Extract zip files
for fname in ["release_test_patients.zip", "release_validate_patients.zip", "release_train_patients.zip"]:
    zip_path = os.path.join(TARGET_DIR, fname)
    print(f"Extracting {fname}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(TARGET_DIR)
    print(f"Extracted {fname} successfully.")

print("All files downloaded and extracted successfully!")
