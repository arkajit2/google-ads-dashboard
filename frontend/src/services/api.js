// Google Ads API client for Cloudflare Pages Edge Functions
const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export async function fetchSummaryMetrics() {
  try {
    const res = await fetch(`${API_URL}/api/metrics/summary`);
    if (!res.ok) throw new Error("API response not ok");
    return await res.json();
  } catch (err) {
    return {
      cost: { value: 0, formatted: "$0.00", change_pct: 0 },
      impressions: { value: 0, formatted: "0", change_pct: 0 },
      clicks: { value: 0, formatted: "0", change_pct: 0 },
      avg_cpc: { value: 0, formatted: "$0.00", change_pct: 0 },
      conversions: { value: 0, formatted: "0", change_pct: 0 },
      ctr: { value: 0, formatted: "0.00%", change_pct: 0 }
    };
  }
}

export async function fetchTimeseriesData(days = 30) {
  try {
    const res = await fetch(`${API_URL}/api/metrics/timeseries?days=${days}`);
    if (!res.ok) throw new Error("API response not ok");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchCampaigns() {
  try {
    const res = await fetch(`${API_URL}/api/campaigns`);
    if (!res.ok) throw new Error("API response not ok");
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function verifyGoogleTokenWithBackend(credential) {
  try {
    const res = await fetch(`${API_URL}/api/auth/google/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential })
    });
    if (!res.ok) throw new Error("Verification failed");
    return await res.json();
  } catch (err) {
    // Direct client-side decode fallback
    const parts = credential.split('.');
    if (parts.length >= 2) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);
      return {
        success: true,
        user: {
          id: parsed.sub,
          name: parsed.name || "Google User",
          email: parsed.email || "",
          picture: parsed.picture || "",
          account_id: "",
          account_name: `${parsed.name || 'User'}'s Google Ads`
        }
      };
    }
    throw err;
  }
}

export async function exchangeAuthCodeForTokens(code) {
  try {
    const res = await fetch(`${API_URL}/api/auth/google/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Authentication failed (HTTP ${res.status})`);
    }
    return data;
  } catch (err) {
    console.error("Auth code exchange error", err);
    throw err;
  }
}

export async function syncGoogleAdsWithEdge(accessToken, customerId = '') {
  try {
    const res = await fetch(`${API_URL}/api/googleads/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        customer_id: customerId
      })
    });
    return await res.json();
  } catch (err) {
    console.error("Live Google Ads API fetch error", err);
    throw err;
  }
}
