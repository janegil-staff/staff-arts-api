// app/api/exchange-rates/route.js
//
// Returns exchange rates relative to USD.
// Uses a free API and caches for 24 hours.

import { NextResponse } from "next/server";

var cachedRates = null;
var cacheTime = 0;
var CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback rates in case the API is down
var FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NOK: 10.85,
  SEK: 10.45,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.5,
  CHF: 0.88,
};

export async function GET() {
  try {
    var now = Date.now();

    // Return cached rates if still fresh
    if (cachedRates && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: { rates: cachedRates, cached: true },
      });
    }

    // Fetch fresh rates from free API
    var res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      var json = await res.json();
      if (json.rates) {
        // Only keep the currencies we care about
        var rates = {};
        var supported = [
          "USD",
          "EUR",
          "GBP",
          "NOK",
          "SEK",
          "CAD",
          "AUD",
          "JPY",
          "CHF",
        ];
        supported.forEach(function (code) {
          if (json.rates[code]) rates[code] = json.rates[code];
        });
        cachedRates = rates;
        cacheTime = now;
        return NextResponse.json({
          success: true,
          data: { rates: rates, cached: false },
        });
      }
    }

    // API failed — use fallback
    return NextResponse.json({
      success: true,
      data: { rates: FALLBACK_RATES, cached: false, fallback: true },
    });
  } catch (err) {
    console.error("[exchange-rates] Error:", err.message);
    return NextResponse.json({
      success: true,
      data: { rates: FALLBACK_RATES, cached: false, fallback: true },
    });
  }
}
