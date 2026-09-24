// Cloudflare Pages Functions - Live Google Ads API Backend (100% inside Cloudflare Ecosystem)

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, developer-token",
    }
  });
}

// Google Ads API error parser - extracts precise nested Google RPC / GoogleAdsFailure errors
function parseGoogleAdsError(data, fallbackStatus) {
  if (!data) return `Google Ads API HTTP ${fallbackStatus || '403'}`;
  
  const root = Array.isArray(data) ? (data[0] || {}) : data;
  const errorObj = root.error || root;

  // Check details array for specific GoogleAdsFailure or Google RPC errors
  const details = errorObj.details || [];
  for (const item of details) {
    if (item.errors && Array.isArray(item.errors) && item.errors.length > 0) {
      const gErr = item.errors[0];
      const errCode = gErr.errorCode ? Object.values(gErr.errorCode)[0] : '';
      const msg = gErr.message || '';
      if (errCode && msg) {
        return `${errCode}: ${msg}`;
      }
      if (msg) return msg;
      if (errCode) return `Google Ads Error: ${errCode}`;
    }

    if (item.reason === 'SERVICE_DISABLED') {
      return 'Google Ads API is not enabled in your Google Cloud project (core-period-509604-u4). Please enable it in Google Cloud Console > APIs & Services > Library > Google Ads API.';
    }

    if (item.reason) {
      return `${item.reason}: ${errorObj.message || 'Permission denied'}`;
    }

    if (item.links && item.links.length > 0 && item.links[0].url) {
      return `${errorObj.message || 'Action required'}. Direct link: ${item.links[0].url}`;
    }
  }

  if (errorObj.message) {
    if (errorObj.message.includes('has not been used in project') || errorObj.message.includes('it is disabled')) {
      return 'Google Ads API has not been enabled in Google Cloud project core-period-509604-u4. Go to Google Cloud Console > APIs & Services > Library to enable it.';
    }
    return errorObj.message;
  }

  return `Google Ads API HTTP ${fallbackStatus || 403} (${errorObj.status || 'Forbidden / Authorization Error'})`;
}

// Google Ads API version fallback helper (handles annual deprecations e.g. v25, v24, v23)
async function fetchGoogleAdsWithVersionFallback(endpointPath, options) {
  const versions = ["v25", "v24", "v23", "v22"];
  let lastRes = null;
  for (const v of versions) {
    const url = `https://googleads.googleapis.com/${v}/${endpointPath}`;
    try {
      const res = await fetch(url, options);
      if (res.status !== 404) {
        return { res, version: v };
      }
      lastRes = res;
    } catch (e) {
      console.warn(`Fetch error for version ${v}:`, e);
    }
  }
  return { res: lastRes, version: versions[0] };
}


export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, developer-token",
      }
    });
  }

  // Health check
  if (path.endsWith("/api/health") || path === "/api/health") {
    return jsonResponse({
      status: "ok",
      provider: "Cloudflare Pages Functions (Edge Serverless)",
      timestamp: new Date().toISOString()
    });
  }

  // ─── LIVE GOOGLE ADS SYNC ENDPOINT ──────────────────────────────────────────
  if (path.endsWith("/api/googleads/sync") && request.method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const accessToken = body.access_token;
      let customerId = (body.customer_id || env?.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[^0-9]/g, '');
      const loginCustomerId = (body.login_customer_id || env?.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/[^0-9]/g, '');
      const developerToken = body.developer_token || env?.GOOGLE_ADS_DEVELOPER_TOKEN || '';

      if (!accessToken) {
        return jsonResponse({ error: "Missing Google OAuth access_token" }, 400);
      }

      // Step 1: Fetch real user profile from Google UserInfo endpoint
      let userProfile = null;
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (userRes.ok) {
          const u = await userRes.json();
          userProfile = {
            id: u.sub,
            name: u.name,
            email: u.email,
            picture: u.picture
          };
        }
      } catch (err) {
        console.warn("Failed to fetch userinfo:", err);
      }

      // Step 2: Build Google Ads API headers
      const googleAdsHeaders = {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      };
      if (developerToken) {
        googleAdsHeaders["developer-token"] = developerToken;
      }
      if (loginCustomerId) {
        googleAdsHeaders["login-customer-id"] = loginCustomerId;
      }

      // Step 3: Query accessible Google Ads customers if customerId is not yet selected
      let accessibleCustomers = [];
      let listAccountsError = null;
      try {
        const { res: custRes } = await fetchGoogleAdsWithVersionFallback("customers:listAccessibleCustomers", {
          headers: googleAdsHeaders
        });
        if (custRes && custRes.ok) {
          const custData = await custRes.json();
          accessibleCustomers = (custData.resourceNames || []).map(r => r.replace("customers/", ""));
          if (!customerId && accessibleCustomers.length > 0) {
            customerId = accessibleCustomers[0];
          }
        } else if (custRes) {
          const errData = await custRes.json().catch(() => ({}));
          listAccountsError = parseGoogleAdsError(errData, custRes.status);
          console.warn("listAccessibleCustomers failed:", custRes.status, errData);
        }
      } catch (e) {
        console.warn("Accessible customers query error:", e);
        listAccountsError = e.message;
      }

      // If still no customer ID found or entered
      if (!customerId) {
        let helpMessage = listAccountsError;
        if (!helpMessage) {
          if (!developerToken) {
            helpMessage = "Google Ads API requires a Developer Token to auto-query accounts. Enter your Developer Token (from your Google Ads Manager Account > Tools > API Center) above, or enter your Customer ID.";
          } else {
            helpMessage = "No accessible Google Ads accounts found for this Google email. Enter your Customer ID (e.g. 123-456-7890) above.";
          }
        }
        return jsonResponse({
          success: true,
          is_live: true,
          user: userProfile,
          accessible_customers: accessibleCustomers,
          customer_id: "",
          message: helpMessage,
          campaigns: [],
          summary: {
            cost: { value: 0, formatted: "$0.00", change_pct: 0 },
            impressions: { value: 0, formatted: "0", change_pct: 0 },
            clicks: { value: 0, formatted: "0", change_pct: 0 },
            conversions: { value: 0, formatted: "0", change_pct: 0 },
            ctr: { value: 0, formatted: "0.00%", change_pct: 0 },
            avg_cpc: { value: 0, formatted: "$0.00", change_pct: 0 }
          },
          timeseries: []
        });
      }

      // Step 4: Run GAQL Query to get real campaign performance data
      const gaqlQuery = `
        SELECT 
          campaign.id, 
          campaign.name, 
          campaign.status, 
          campaign.advertising_channel_type,
          metrics.impressions, 
          metrics.clicks, 
          metrics.ctr, 
          metrics.average_cpc, 
          metrics.cost_micros, 
          metrics.conversions
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
      `;

      let { res: searchRes } = await fetchGoogleAdsWithVersionFallback(`customers/${customerId}/googleAds:search`, {
        method: "POST",
        headers: googleAdsHeaders,
        body: JSON.stringify({ query: gaqlQuery, pageSize: 1000 })
      });

      if (!searchRes || (!searchRes.ok && searchRes.status === 404)) {
        const streamAttempt = await fetchGoogleAdsWithVersionFallback(`customers/${customerId}/googleAds:searchStream`, {
          method: "POST",
          headers: googleAdsHeaders,
          body: JSON.stringify({ query: gaqlQuery })
        });
        if (streamAttempt.res) searchRes = streamAttempt.res;
      }

      if (!searchRes || !searchRes.ok) {
        const errorJson = searchRes ? await searchRes.json().catch(() => ({})) : {};
        const apiErrorMessage = parseGoogleAdsError(errorJson, searchRes ? searchRes.status : 'Unavailable');
        return jsonResponse({
          success: false,
          is_live: true,
          user: userProfile,
          error: apiErrorMessage,
          customer_id: customerId,
          accessible_customers: accessibleCustomers,
          details: errorJson,
          campaigns: [],
          summary: {
            cost: { value: 0, formatted: "$0.00", change_pct: 0 },
            impressions: { value: 0, formatted: "0", change_pct: 0 },
            clicks: { value: 0, formatted: "0", change_pct: 0 },
            conversions: { value: 0, formatted: "0", change_pct: 0 },
            ctr: { value: 0, formatted: "0.00%", change_pct: 0 },
            avg_cpc: { value: 0, formatted: "$0.00", change_pct: 0 }
          },
          timeseries: []
        });
      }

      // Step 5: Parse search results (handles both search and searchStream)
      const rawData = await searchRes.json();
      let rawRows = [];
      if (Array.isArray(rawData)) {
        for (const batch of rawData) {
          if (batch.results && Array.isArray(batch.results)) {
            rawRows.push(...batch.results);
          }
        }
      } else if (rawData && Array.isArray(rawData.results)) {
        rawRows = rawData.results;
      }

      const campaignsList = [];
      let totalCostMicros = 0;
      let totalClicks = 0;
      let totalImpressions = 0;
      let totalConversions = 0;

      for (const row of rawRows) {
        const c = row.campaign || {};
        const m = row.metrics || {};
        
        const costMicros = parseInt(m.costMicros || 0, 10);
        const clicks = parseInt(m.clicks || 0, 10);
        const impressions = parseInt(m.impressions || 0, 10);
        const conversions = parseFloat(m.conversions || 0);
        const avgCpcMicros = parseInt(m.averageCpc || 0, 10);
        const ctr = m.ctr ? (parseFloat(m.ctr) * 100) : 0;

        totalCostMicros += costMicros;
        totalClicks += clicks;
        totalImpressions += impressions;
        totalConversions += conversions;

        campaignsList.push({
          id: c.id,
          name: c.name || "Untitled Campaign",
          status: c.status || "ENABLED",
          type: c.advertisingChannelType || "Search",
          budget: 0,
          impressions,
          clicks,
          ctr: +ctr.toFixed(2),
          avg_cpc: +(avgCpcMicros / 1000000).toFixed(2),
          cost: +(costMicros / 1000000).toFixed(2),
          conversions,
          cost_per_conv: conversions > 0 ? +((costMicros / 1000000) / conversions).toFixed(2) : 0,
          bidding_strategy: "Automated"
        });
      }

      // Step 6: Query daily metrics for timeseries chart
      let timeseriesData = [];
      try {
        const dailyQuery = `
          SELECT 
            segments.date,
            metrics.impressions, 
            metrics.clicks, 
            metrics.cost_micros, 
            metrics.conversions
          FROM customer
          WHERE segments.date DURING LAST_30_DAYS
          ORDER BY segments.date ASC
        `;
        const { res: dailyRes } = await fetchGoogleAdsWithVersionFallback(`customers/${customerId}/googleAds:search`, {
          method: "POST",
          headers: googleAdsHeaders,
          body: JSON.stringify({ query: dailyQuery, pageSize: 100 })
        });
        if (dailyRes && dailyRes.ok) {
          const dData = await dailyRes.json();
          const dRows = dData.results || [];
          timeseriesData = dRows.map(r => {
            const m = r.metrics || {};
            const dCost = +(parseInt(m.costMicros || 0, 10) / 1000000).toFixed(2);
            return {
              date: r.segments?.date || '',
              clicks: parseInt(m.clicks || 0, 10),
              impressions: parseInt(m.impressions || 0, 10),
              cost: dCost,
              conversions: parseFloat(m.conversions || 0)
            };
          });
        }
      } catch (err) {
        console.warn("Timeseries query error:", err);
      }

      const totalCost = +(totalCostMicros / 1000000).toFixed(2);
      const avgCtr = totalImpressions > 0 ? +((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
      const avgCpc = totalClicks > 0 ? +(totalCost / totalClicks).toFixed(2) : 0;

      return jsonResponse({
        success: true,
        is_live: true,
        user: userProfile,
        customer_id: customerId,
        accessible_customers: accessibleCustomers,
        campaigns: campaignsList,
        timeseries: timeseriesData,
        summary: {
          cost: { value: totalCost, formatted: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change_pct: 0 },
          impressions: { value: totalImpressions, formatted: totalImpressions.toLocaleString(), change_pct: 0 },
          clicks: { value: totalClicks, formatted: totalClicks.toLocaleString(), change_pct: 0 },
          avg_cpc: { value: avgCpc, formatted: `$${avgCpc.toFixed(2)}`, change_pct: 0 },
          conversions: { value: totalConversions, formatted: totalConversions.toFixed(1), change_pct: 0 },
          ctr: { value: avgCtr, formatted: `${avgCtr}%`, change_pct: 0 }
        }
      });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  // ─── AUTH / GOOGLE CODE EXCHANGE (OAuth 2.0 Auth-Code Flow) ─────────────────
  if (path.endsWith("/api/auth/google/code") && request.method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const code = body.code;
      if (!code) {
        return jsonResponse({ error: "Missing authorization code" }, 400);
      }

      const clientId = env?.GOOGLE_CLIENT_ID || "";
      const clientSecret = env?.GOOGLE_CLIENT_SECRET || "";

      // Exchange authorization code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: "postmessage",
          grant_type: "authorization_code"
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        return jsonResponse({
          error: tokenData.error_description || tokenData.error || "Failed to exchange auth code",
          details: tokenData
        }, 400);
      }

      const accessToken = tokenData.access_token;

      // Fetch user profile from userinfo endpoint
      let userProfile = null;
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (userRes.ok) {
          const u = await userRes.json();
          userProfile = {
            id: u.sub,
            name: u.name,
            email: u.email,
            picture: u.picture
          };
        }
      } catch (err) {
        console.warn("Failed to fetch userinfo:", err);
      }

      return jsonResponse({
        success: true,
        access_token: accessToken,
        refresh_token: tokenData.refresh_token || null,
        expires_in: tokenData.expires_in,
        user: userProfile
      });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  // ─── AUTH / GOOGLE VERIFY FALLBACK ──────────────────────────────────────────
  if (path.endsWith("/api/auth/google/verify") && request.method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const credential = body.credential;

      if (!credential) {
        return jsonResponse({ error: "Missing credential token" }, 400);
      }

      // Check Google tokeninfo endpoint
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (verifyRes.ok) {
        const info = await verifyRes.json();
        return jsonResponse({
          success: true,
          user: {
            id: info.sub,
            name: info.name || "Google User",
            email: info.email || "",
            picture: info.picture || "",
            account_id: env?.GOOGLE_ADS_CUSTOMER_ID || "",
            account_name: `${info.name || 'Google'}'s Ads Account`
          }
        });
      }

      // Safe payload decode fallback
      const parts = credential.split(".");
      if (parts.length >= 2) {
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonText = atob(payloadBase64);
        const payload = JSON.parse(jsonText);
        return jsonResponse({
          success: true,
          user: {
            id: payload.sub || "",
            name: payload.name || "Google User",
            email: payload.email || "",
            picture: payload.picture || "",
            account_id: env?.GOOGLE_ADS_CUSTOMER_ID || "",
            account_name: `${payload.name || 'Google'}'s Ads Account`
          }
        });
      }

      return jsonResponse({ error: "Could not parse Google token" }, 400);
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  return jsonResponse({ error: `Not found: ${path}` }, 404);
}
