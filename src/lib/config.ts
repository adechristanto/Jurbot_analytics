export const config = {
  defaultWebhookUrl: process.env.NEXT_PUBLIC_DEFAULT_WEBHOOK_URL || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
}; 