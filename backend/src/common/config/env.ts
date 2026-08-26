import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET as string,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
};

const requiredEnvVars = ['PORT', 'NODE_ENV', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
