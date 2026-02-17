import { createFetcher } from "../../../utils";
import { getters } from "../../../config";
import { rateModel } from "../../../models";
// make sure the path is correct
import { logger } from "netwrap";

// Fetch exchange rates and store/update them in the database
const fetchAndStoreRates = async () => {
  const MAJOR_CURRENCIES = [
    "USD", // US Dollar
    "EUR", // Euro (Europe)
    "GBP", // British Pound (UK)
    "CAD", // Canadian Dollar
    // Add other major currencies as needed
  ];
  
  // "JPY", // Japanese Yen
  // "CHF", // Swiss Franc
  // "CNY", // Chinese Yuan
  // "AUD", // Australian Dollar
  // "CAD", // Canadian Dollar
  //    "GHS", // Ghanaian Cedi
  logger("⏳ Starting scheduled rate fetch...");

  try {
   
    // const paramsBody = { base: "USD", symbols: "" };
    const paramsBody = { base: "NGN", symbols: "" };
    const url = `${getters.getRapidApiResource().RATESSURL}latest`;
    const fetcher = createFetcher({
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": getters.getRapidApiResource().RATESSAPIKEY,
        "x-rapidapi-host": getters.getRapidApiResource().RATESSAPIHOST,
      },
      method: "get",
      url,
      query: { ...paramsBody },
      params: {},
      data: {},
      timeout: 60 * 9 * 1000,
    });

    const responseData = await fetcher.trigger();

    const { base, rates } = responseData.payload;

    logger(`⏳ Fetching feeds from ${url}...`);
    logger(`⏳ Response data: ${JSON.stringify(responseData)}`);

    // Filter rates to only major currencies
    const filteredRates = Object.entries(rates).filter(([currency]) =>
      MAJOR_CURRENCIES.includes(currency),
    );
    //console.log(filteredRates);
    //  const operations = Object.entries(rates).map(async ([currency, value]) => {
    const operations = filteredRates.map(async ([currency, value]) => {
      const from = base;
      const to = currency;
      const rate = (value as any).toString();
      const per = "1";

      // Try to find existing rate
      const existing = await rateModel.findRate({
        from: { $regex: from, $options: "i" },
        to: { $regex: to, $options: "i" }, // case-insensitive search
      });

      if (existing.status === true) {
        await rateModel.updateRateById(existing.payload?._id, { rate, per });
        logger(`🔁 Updated rate: ${from} to ${to} = ${rate}`);
      } else {
        await rateModel.saveRate({ from, to, rate, per });
        logger(`✅ Created rate: ${from} to ${to} = ${rate}`);
      }
    });

    await Promise.all(operations);
    logger("✅ Completed scheduled rate job.");
  } catch (error: any) {
    logger(`❌ Error fetching or storing rates: ${error.message}`);
  }
};

export { fetchAndStoreRates };

// const responseData = {
//   message: "Successfully made request",
//   payload: {
//     success: true,
//     timestamp: 1748963047,
//     base: "EUR",
//     date: "2025-06-03",
//     rates: {
//       AED: 4.184165,
//       AFN: 79.276097,
//       ALL: 98.194735,
//       AMD: 437.292977,
//       ANG: 2.0388,
//       AOA: 1045.211389,
//       ARS: 1350.407759,
//       AUD: 1.76109,
//       AWG: 2.051982,
//       AZN: 1.936484,
//       BAM: 1.955721,
//       BBD: 2.301187,
//       BDT: 139.265809,
//       BGN: 1.957383,
//       BHD: 0.429484,
//       BIF: 3392.718081,
//       BMD: 1.139199,
//       BND: 1.468528,
//       BOB: 7.875612,
//       BRL: 6.430438,
//       BSD: 1.139744,
//       BTC: 0.000010686719,
//       BTN: 97.645764,
//       BWP: 15.29918,
//       BYN: 3.729916,
//       BYR: 22328.298749,
//       BZD: 2.289387,
//       CAD: 1.561563,
//       CDF: 3263.805215,
//       CHF: 0.937583,
//       CLF: 0.027907,
//       CLP: 1070.972032,
//       CNY: 8.207127,
//       CNH: 8.189114,
//       COP: 4719.017589,
//       CRC: 580.171437,
//       CUC: 1.139199,
//       CUP: 30.188771,
//       CVE: 110.256185,
//       CZK: 24.898347,
//       DJF: 202.960008,
//       DKK: 7.459714,
//       DOP: 67.297278,
//       DZD: 149.976479,
//       EGP: 56.618415,
//       ERN: 17.087984,
//       ETB: 155.618439,
//       EUR: 1,
//       FJD: 2.566962,
//       FKP: 0.840881,
//       GBP: 0.842033,
//       GEL: 3.121492,
//       GGP: 0.840881,
//       GHS: 11.659426,
//       GIP: 0.840881,
//       GMD: 82.022528,
//       GNF: 9878.210191,
//       GTQ: 8.753108,
//       GYD: 238.448261,
//       HKD: 8.936862,
//       HNL: 29.695799,
//       HRK: 7.537055,
//       HTG: 149.202655,
//       HUF: 403.853979,
//       IDR: 18590.587106,
//       ILS: 4.010037,
//       IMP: 0.840881,
//       INR: 97.616303,
//       IQD: 1493.039602,
//       IRR: 47988.754031,
//       ISK: 144.610001,
//       JEP: 0.840881,
//       JMD: 181.802645,
//       JOD: 0.807639,
//       JPY: 163.742186,
//       KES: 147.241747,
//       KGS: 99.622858,
//       KHR: 4570.754914,
//       KMF: 494.980357,
//       KPW: 1025.208916,
//       KRW: 1569.724979,
//       KWD: 0.349369,
//       KYD: 0.949749,
//       KZT: 583.741262,
//       LAK: 24616.788083,
//       LBP: 102119.9725,
//       LKR: 341.165235,
//       LRD: 227.377808,
//       LSL: 20.41222,
//       LTL: 3.363759,
//       LVL: 0.689091,
//       LYD: 6.204749,
//       MAD: 10.480462,
//       MDL: 19.602949,
//       MGA: 5179.744994,
//       MKD: 61.546557,
//       MMK: 2391.634244,
//       MNT: 4075.401299,
//       MOP: 9.210247,
//       MRU: 45.053177,
//       MUR: 51.753642,
//       MVR: 17.612426,
//       MWK: 1976.302704,
//       MXN: 21.91764,
//       MYR: 4.835882,
//       MZN: 72.806276,
//       NAD: 20.413474,
//       NGN: 1803.328722,
//       NIO: 41.937567,
//       NOK: 11.541008,
//       NPR: 156.234308,
//       NZD: 1.897034,
//       OMR: 0.438036,
//       PAB: 1.139744,
//       PEN: 4.126461,
//       PGK: 4.682626,
//       PHP: 63.460236,
//       PKR: 322.584029,
//       PLN: 4.278048,
//       PYG: 9106.631608,
//       QAR: 4.155668,
//       RON: 5.057133,
//       RSD: 117.229219,
//       RUB: 89.985257,
//       RWF: 1612.613531,
//       SAR: 4.271962,
//       SBD: 9.513185,
//       SCR: 16.46275,
//       SDG: 684.094905,
//       SEK: 10.945059,
//       SGD: 1.467733,
//       SHP: 0.895231,
//       SLE: 25.882415,
//       SLL: 23888.431907,
//       SOS: 651.367932,
//       SRD: 42.318396,
//       STD: 23579.117523,
//       SVC: 9.972203,
//       SYP: 14811.653547,
//       SZL: 20.403995,
//       THB: 37.16238,
//       TJS: 11.283345,
//       TMT: 3.992892,
//       TND: 3.392663,
//       TOP: 2.668117,
//       TRY: 44.574951,
//       TTD: 7.733619,
//       TWD: 34.197382,
//       TZS: 3064.444768,
//       UAH: 47.337515,
//       UGX: 4150.832086,
//       USD: 1.139199,
//       UYU: 47.516201,
//       UZS: 14627.830437,
//       VES: 108.049058,
//       VND: 29681.82775,
//       VUV: 137.657495,
//       WST: 3.146095,
//       XAF: 655.921829,
//       XAG: 0.033038,
//       XAU: 0.000341,
//       XCD: 3.078742,
//       XDR: 0.812174,
//       XOF: 655.904557,
//       XPF: 119.331742,
//       YER: 277.793722,
//       ZAR: 20.380291,
//       ZMK: 10254.150035,
//       ZMW: 30.601493,
//       ZWL: 366.821586,
//     },
//   },
//   status: true,
// };
