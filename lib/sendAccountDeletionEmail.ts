import { env } from '@/env.server';

/**
 * Абстракция для отправки писем о soft delete аккаунта.
 * В зависимости от ENV отправляет через AWS SES или пишет в лог.
 */
export async function sendAccountDeletionEmail({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  if (env.USE_EMAIL_MOCK === 'true') {
    console.log(`[MOCK] Would send account deletion email to ${email} for user ${fullName}`);
    return;
  }

  // 🚀 Здесь будет реальная интеграция с AWS SES
  throw new Error('AWS SES integration not implemented yet.');
}
