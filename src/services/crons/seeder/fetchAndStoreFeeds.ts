import { getters } from "../../../config";
import { createFetcher } from "../../../utils";
import { logger } from "netwrap";

// Utility: Get today's date in yyyy-mm-dd format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // yyyy-mm-dd
};

const fetchAndStoreFeeds = async ({
  date = getTodayDate(),
  pageSize = 50,
  maxPages = 500,
}: {
  date?: string;
  pageSize?: number;
  maxPages?: number;
} = {}) => {
  void date;
  void pageSize;
  void maxPages;
  void getters;
  void createFetcher;
  logger("⏸ fetchAndStoreFeeds is disabled: no feeds model is configured.");
};

export { fetchAndStoreFeeds };
