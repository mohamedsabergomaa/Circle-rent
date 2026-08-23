// @ts-ignore
/// <reference types="node" />

import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './backend/prisma/schema.prisma',  
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});