#!/bin/bash

BASE_URL="http://localhost:8080/api/v1"

echo "======================================"
echo "🚀 Testing Swipe Engine API"
echo "======================================"

echo -e "\n1️⃣ Candidate (C1) Swipes RIGHT on Job (J1)"
curl -s -X POST "$BASE_URL/swipes" \
     -H "Content-Type: application/json" \
     -d '{
           "candidateId": "C1",
           "jobId": "J1",
           "swiperRole": "CANDIDATE",
           "direction": "RIGHT"
         }'

echo -e "\n\n2️⃣ Recruiter (R1) Swipes RIGHT on Candidate (C1) for Job (J1)"
echo "   (This should trigger a mutual match!)"
curl -s -X POST "$BASE_URL/swipes" \
     -H "Content-Type: application/json" \
     -d '{
           "candidateId": "C1",
           "jobId": "J1",
           "swiperRole": "RECRUITER",
           "direction": "RIGHT"
         }'

echo -e "\n\n3️⃣ Checking Matches for Candidate (C1)"
curl -s -X GET "$BASE_URL/matches/candidate/C1" | python3 -m json.tool

echo -e "\n======================================"
echo "✅ Test Completed"
echo "======================================"
