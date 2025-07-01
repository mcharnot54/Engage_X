#!/bin/bash
# Load environment variables from .env.local
export $(grep -v '^#' .env.local | xargs)
# Run Prisma database push
npx prisma db push
