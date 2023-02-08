import { ServerRespond } from "./DataStreamer";

// setting up the object to be passed into the generateRow function
export interface Row {
  price_abc: number;
  price_def: number;
  ratio: number;
  timestamp: Date;
  upper_bound: number;
  lower_bound: number;
  trigger_alert: number | undefined;
}

export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    //start off by calculating the prices of both stocks
    const priceABC =
      (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF =
      (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;

    //the compute the ratio between both stocks
    const ratio = priceABC / priceDEF;

    //set the lower and upper bounds
    const upperBound = 1 + 0.05;
    const lowerBound = 1 - 0.05;
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp:
        serverRespond[0].timestamp > serverRespond[1].timestamp
          ? serverRespond[0].timestamp
          : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,

      // determine the trigger_alert value
      trigger_alert:
        ratio > upperBound || ratio < lowerBound ? ratio : undefined,
    };
  }
}

