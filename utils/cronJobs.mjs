import cron from "node-cron";
import User from "../models/User.mjs";
import { sendBirthdayEmail } from "../services/emailService.mjs";

/**
 * Initialize cron jobs for birthday reminders
 * @param {Object} options - Configuration options for cron jobs
 * @param {string} options.timezone - Timezone for the cron job (default: 'UTC')
 * @param {string} options.schedule - Cron schedule expression (default: '0 7 * * *')
 * @param {number} options.batchSize - Number of emails to process in one batch (default: 50)
 * @param {number} options.delayBetweenEmails - Delay between emails in ms (default: 1000)
 */
export const initCronJobs = (options = {}) => {
  // Default configuration options
  const config = {
    timezone: process.env.CRON_TIMEZONE || "UTC",
    schedule: process.env.CRON_SCHEDULE || "0 7 * * *",
    batchSize: process.env.CRON_BATCH_SIZE
      ? parseInt(process.env.CRON_BATCH_SIZE)
      : 50,
    delayBetweenEmails: process.env.CRON_DELAY
      ? parseInt(process.env.CRON_DELAY)
      : 1000,
    ...options,
  };

  console.log(
    `Initializing birthday cron job with schedule: ${config.schedule} (${config.timezone})`
  );

  // Schedule job to run according to the configured schedule
  cron.schedule(
    config.schedule,
    async () => {
      console.log(`Running birthday check at ${new Date().toISOString()}`);

      try {
        const today = new Date();
        const month = today.getMonth() + 1; // JavaScript months are 0-indexed
        const day = today.getDate();

        console.log(`Checking for birthdays on ${month}/${day}`);

        // Find all users whose birthday is today
        const birthdayUsers = await User.find({
          $expr: {
            $and: [
              { $eq: [{ $month: "$dateOfBirth" }, month] },
              { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
            ],
          },
        });

        console.log(`Found ${birthdayUsers.length} birthdays today.`);

        // Process users in batches to avoid overwhelming the email service
        const processBatch = async (startIndex) => {
          const endIndex = Math.min(
            startIndex + config.batchSize,
            birthdayUsers.length
          );

          for (let i = startIndex; i < endIndex; i++) {
            const user = birthdayUsers[i];
            try {
              await sendBirthdayEmail(user);
              console.log(
                `Birthday email sent to ${user.username} (${user.email}) [${
                  i + 1
                }/${birthdayUsers.length}]`
              );

              // Add a small delay between emails to avoid rate limiting
              if (i < endIndex - 1) {
                await new Promise((resolve) =>
                  setTimeout(resolve, config.delayBetweenEmails)
                );
              }
            } catch (error) {
              console.error(
                `Failed to send email to ${user.username}: ${error.message}`
              );
            }
          }

          // Process next batch if there are more users
          if (endIndex < birthdayUsers.length) {
            await processBatch(endIndex);
          } else {
            console.log("Birthday email sending completed.");
          }
        };

        // Start processing from the first user
        if (birthdayUsers.length > 0) {
          await processBatch(0);
        }
      } catch (error) {
        console.error(`Birthday cron job error: ${error.message}`);
      }
    },
    {
      scheduled: true,
      timezone: config.timezone,
    }
  );

  // Log system timezone information for debugging
  console.log(
    `Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
  );
  console.log(`Cron job timezone: ${config.timezone}`);
  console.log("Birthday cron job initialized");

  // Add a cron job to log system status daily
  cron.schedule(
    "0 0 * * *",
    () => {
      const memoryUsage = process.memoryUsage();
      console.log(`Daily system status - ${new Date().toISOString()}`);
      console.log(
        `Memory usage: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`
      );
    },
    {
      scheduled: true,
      timezone: config.timezone,
    }
  );
};
