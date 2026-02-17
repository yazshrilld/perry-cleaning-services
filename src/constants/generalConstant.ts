export const generalConstant = {
  en: {
    ENVIRONMENT: {
      STAGING: "staging",
      PRODUCTION: "production",
      DEVELOPMENT: "development",
    },
    LOGS: {
      RUNNING_APP: "App up and running on",
      ROUTES: {
        HEALTH_CHECK: {
          SUCCESS: "Service is up and running fine",
        },
        WILDCARD: "Resource not found",
      },
    },
    APP: {
      SITE_NAME: "Perry Cleans",
      TOKENS: {
        ACCESS_TOKEN_COOKIE_NAME: "cyber_access_token",
        REFRESH_TOKEN_COOKIE_NAME: "cyber_refresh_token",
      },
    },
    USER: {
      TYPES: {
        CUSTOMER: "CUSTOMER",
        DESIGNER: "DESIGNER",
        ADMIN: "ADMIN",
      },
    },
    CONTEST: {
      DURATIONS: {
        STANDARD: "STANDARD",
        EXPRESS: "EXPRESS",
      },
      STATUS: {
        IN_PROGRESS: "IN_PROGRESS",
        OPEN: "OPEN",
        COMPLETED: "COMPLETED",
        FINAL: "FINAL",
      },
      COMMENT_FLAG: {
        DESIGN: "DESIGN",
        CONTEST: "CONTEST",
      },
      LIMITS: {
        MIN_WORK_SAMPLES: 2,
        MAX_FINALISTS: 6,
      },
    },
    PAYMENT: {
      CHANNELS: {
        CARD: "CARD",
        BANK_TRANSFER: "BANK_TRANSFER",
        CRYPTO: "CRYPTO",
      },
      ITEM_TYPE: {
        CONTEST: "CONTEST",
      },
      STATUS: {
        IN_PROGRESS: "IN_PROGRESS",
        SUCCESS: "SUCCESS",
        FAILED: "FAILED",
      },
    },
  },
};
