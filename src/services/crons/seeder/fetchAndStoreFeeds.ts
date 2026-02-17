import { getters } from "../../../config";
import { feedsModel } from "../../../models";
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
  logger("⏳ Starting scheduled feed fetch...");
  let currentPage = 0;
  try {
    const paramsBody = {};
    while (currentPage < maxPages) {
      const url = `${getters.getRapidApiResource().FEEDSHOST}articles-by-trends/${date}/${currentPage}/${pageSize}`;
      const fetcher = createFetcher({
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": getters.getRapidApiResource().FEEDSAPIKEY,
          "x-rapidapi-host": getters.getRapidApiResource().FEEDSAPIHOST,
        },
        method: "get",
        url,
        query: { ...paramsBody },
        params: {},
        data: {},
        timeout: 60 * 9 * 1000,
      });

      const responseData = await fetcher.trigger();

      logger(`⏳ Fetching feeds from ${url}...`);
      logger(`⏳ Response data: ${JSON.stringify(responseData)}`);

      const articles = responseData.payload.articles;

      for (const item of articles) {
        const existing = await feedsModel.findFeeds({
          guid: String(item.articlesId),
        });

        if (existing.status == false) {
          feedsModel.saveFeeds({
            guid: String(item.articlesId),
            provider: "Reuters",
            author: item.authors[0].authorName || "Unknown",
            title: item.articlesName,
            link: item.urlSupplier || item.canonicalSupplier,
            content: item.articlesDescription,
            content_snippet: item.articlesShortDescription || "",
            categories: item?.tags?.[0]?.name ? [item.tags[0].name] : [],
            iso_date: item.dateModified?.date
              ? new Date(item.dateModified.date)
              : new Date(), // Ensure it's a Date object
            pub_date: item.publishedAt?.date
              ? new Date(item.publishedAt.date)
              : new Date(),
            image:
              item.files?.find(
                (file: { contentType: string }) => file.contentType === "image",
              )?.urlCdn || "",
            uploader: "system", // or however you want to track this
          });

          logger(`✅ Saved new feed: ${item.articlesId}`);
        } else {
          logger(`⏩ Skipped existing feed: ${item.articlesId}`);
        }
      }

      currentPage++;
    }
    logger("✅ Completed scheduled feed job.");
  } catch (error) {
    logger(`❌ Error during feed job error  : ${(error as any).message}`);
  }
};

export { fetchAndStoreFeeds };
