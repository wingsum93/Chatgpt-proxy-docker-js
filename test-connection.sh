#!/bin/bash

# Set your API key here
API_KEY="your_openai_api_key"

# Define the API endpoint to list models
API_URL="https://api.openai.com/v1/models"

# Make the API request using curl
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY"
