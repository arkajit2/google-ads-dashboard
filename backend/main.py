import os
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("google-ads-api")

app = FastAPI(
    title="Google Ads Dashboard API",
    description="Backend API for Google Ads replica dashboard with Google OAuth & Campaign management",
    version="1.0.0"
)

# Allow CORS for development and Cloudflare Pages deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://*.pages.dev",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_ADS_DEVELOPER_TOKEN = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "")
GOOGLE_ADS_CUSTOMER_ID = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "482-910-2391")

# Models
class TokenVerificationRequest(BaseModel):
    credential: str

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    picture: Optional[str] = None
    account_id: Optional[str] = None
    account_name: Optional[str] = None

class CampaignStatusUpdate(BaseModel):
    status: str  # "ENABLED" | "PAUSED"

# In-memory mock database of campaigns (with realistic Google Ads metrics)
DEFAULT_CAMPAIGNS = [
    {
        "id": "cmp_101",
        "name": "Search - High Intent Brand Terms",
        "type": "Search",
        "status": "ENABLED",
        "budget": 125.00,
        "bidding_strategy": "Maximize conversions (Target CPA $14.50)",
        "impressions": 48290,
        "clicks": 4320,
        "ctr": 8.95,
        "avg_cpc": 1.42,
        "cost": 6134.40,
        "conversions": 422.0,
        "cost_per_conv": 14.53,
        "conv_rate": 9.77,
        "opt_score": 94.2
    },
    {
        "id": "cmp_102",
        "name": "Performance Max - Global Q3 Push",
        "type": "Performance Max",
        "status": "ENABLED",
        "budget": 250.00,
        "bidding_strategy": "Maximize conversion value (Target ROAS 380%)",
        "impressions": 194800,
        "clicks": 9840,
        "ctr": 5.05,
        "avg_cpc": 1.15,
        "cost": 11316.00,
        "conversions": 612.0,
        "cost_per_conv": 18.49,
        "conv_rate": 6.22,
        "opt_score": 88.5
    },
    {
        "id": "cmp_103",
        "name": "Search - Non-Brand Core Solutions",
        "type": "Search",
        "status": "ENABLED",
        "budget": 180.00,
        "bidding_strategy": "Target CPA ($22.00)",
        "impressions": 92400,
        "clicks": 5120,
        "ctr": 5.54,
        "avg_cpc": 2.10,
        "cost": 10752.00,
        "conversions": 489.0,
        "cost_per_conv": 21.98,
        "conv_rate": 9.55,
        "opt_score": 82.1
    },
    {
        "id": "cmp_104",
        "name": "Display - Remarketing Dynamic Audience",
        "type": "Display",
        "status": "PAUSED",
        "budget": 50.00,
        "bidding_strategy": "Maximize clicks",
        "impressions": 312000,
        "clicks": 2840,
        "ctr": 0.91,
        "avg_cpc": 0.44,
        "cost": 1249.60,
        "conversions": 58.0,
        "cost_per_conv": 21.54,
        "conv_rate": 2.04,
        "opt_score": 75.0
    },
    {
        "id": "cmp_105",
        "name": "YouTube - In-Stream Product Overview",
        "type": "Video",
        "status": "ENABLED",
        "budget": 85.00,
        "bidding_strategy": "Target CPV ($0.06)",
        "impressions": 164000,
        "clicks": 3410,
        "ctr": 2.08,
        "avg_cpc": 0.88,
        "cost": 3000.80,
        "conversions": 114.0,
        "cost_per_conv": 26.32,
        "conv_rate": 3.34,
        "opt_score": 91.0
    },
    {
        "id": "cmp_106",
        "name": "Search - Competitor Comparison",
        "type": "Search",
        "status": "ENABLED",
        "budget": 95.00,
        "bidding_strategy": "Maximize clicks",
        "impressions": 36100,
        "clicks": 1820,
        "ctr": 5.04,
        "avg_cpc": 2.45,
        "cost": 4459.00,
        "conversions": 142.0,
        "cost_per_conv": 31.40,
        "conv_rate": 7.80,
        "opt_score": 79.4
    }
]

campaigns_db = [c.copy() for c in DEFAULT_CAMPAIGNS]

def generate_timeseries_data(days: int = 30) -> List[Dict[str, Any]]:
    """Generates daily trend data mimicking Google Ads reporting"""
    import math
    data = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        day_date = base_date + timedelta(days=i)
        # Seasonal wave
        day_of_week = day_date.weekday()
        weekend_factor = 0.72 if day_of_week in (5, 6) else 1.05
        wave = math.sin(i / 3.0) * 0.15 + 1.0
        
        clicks = int((950 + (i * 12) + (i % 5 * 40)) * wave * weekend_factor)
        impressions = int(clicks * (18.5 + (i % 3)))
        cpc = round(1.25 + ((i % 7) * 0.05), 2)
        cost = round(clicks * cpc, 2)
        conversions = int(clicks * 0.078)
        cost_per_conv = round(cost / max(conversions, 1), 2)
        
        data.append({
            "date": day_date.strftime("%b %d"),
            "full_date": day_date.strftime("%Y-%m-%d"),
            "clicks": clicks,
            "impressions": impressions,
            "cost": cost,
            "conversions": conversions,
            "cost_per_conv": cost_per_conv,
            "ctr": round((clicks / max(impressions, 1)) * 100, 2)
        })
    return data

@app.get("/")
def read_root():
    return {
        "app": "Google Ads Replica API",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/auth/google/verify")
async def verify_google_token(payload: TokenVerificationRequest):
    """
    Verifies Google ID token from frontend Google Identity Services.
    Decodes the user profile or verifies with Google OAuth libraries.
    """
    credential = payload.credential
    if not credential:
        raise HTTPException(status_code=400, detail="Missing credential")
        
    try:
        # First attempt official google-auth library verification if GOOGLE_CLIENT_ID is set
        if GOOGLE_CLIENT_ID:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            id_info = id_token.verify_oauth2_token(
                credential, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            user_id = id_info.get("sub")
            name = id_info.get("name", "Google User")
            email = id_info.get("email", "")
            picture = id_info.get("picture", "")
        else:
            # Fallback for testing/unconfigured client ID: decode payload safely
            import base64
            parts = credential.split(".")
            if len(parts) >= 2:
                # Add padding
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                id_info = json.loads(decoded_bytes.decode("utf-8"))
                user_id = id_info.get("sub", "usr_google_default")
                name = id_info.get("name", "Google User")
                email = id_info.get("email", "user@gmail.com")
                picture = id_info.get("picture", "https://lh3.googleusercontent.com/a/default-user")
            else:
                raise ValueError("Invalid JWT structure")
                
        return {
            "success": True,
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "picture": picture,
                "account_id": GOOGLE_ADS_CUSTOMER_ID,
                "account_name": f"{name}'s Ad Account"
            }
        }
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        # Allow graceful simulated login for local testing
        return {
            "success": True,
            "simulated": True,
            "user": {
                "id": "usr_demo_8829",
                "name": "Demo Advertiser",
                "email": "advertiser@company.com",
                "picture": "https://lh3.googleusercontent.com/ogw/AF2bZch_google_avatar=s64-c-mo",
                "account_id": GOOGLE_ADS_CUSTOMER_ID,
                "account_name": "Acme Marketing Global"
            }
        }

@app.get("/api/account")
def get_account_details():
    return {
        "customer_id": GOOGLE_ADS_CUSTOMER_ID,
        "name": "Global Performance Hub",
        "currency": "USD",
        "time_zone": "America/New_York (GMT-04:00)",
        "optimization_score": 88.4,
        "manager_account": "982-104-5821",
        "status": "Active"
    }

@app.get("/api/metrics/summary")
def get_metrics_summary():
    """Calculates overall Google Ads summary KPIs"""
    total_cost = sum(c["cost"] for c in campaigns_db)
    total_clicks = sum(c["clicks"] for c in campaigns_db)
    total_impressions = sum(c["impressions"] for c in campaigns_db)
    total_conversions = sum(c["conversions"] for c in campaigns_db)
    
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0
    avg_cpc = (total_cost / total_clicks) if total_clicks else 0
    cost_per_conv = (total_cost / total_conversions) if total_conversions else 0
    conv_rate = (total_conversions / total_clicks * 100) if total_clicks else 0
    avg_opt_score = sum(c["opt_score"] for c in campaigns_db) / len(campaigns_db)

    return {
        "cost": {
            "value": round(total_cost, 2),
            "formatted": f"${total_cost:,.2f}",
            "change_pct": 12.4,
            "is_positive": False # for cost, increase is marked neutral/red
        },
        "impressions": {
            "value": total_impressions,
            "formatted": f"{total_impressions:,}",
            "change_pct": 18.2,
            "is_positive": True
        },
        "clicks": {
            "value": total_clicks,
            "formatted": f"{total_clicks:,}",
            "change_pct": 14.8,
            "is_positive": True
        },
        "avg_cpc": {
            "value": round(avg_cpc, 2),
            "formatted": f"${avg_cpc:.2f}",
            "change_pct": -2.1,
            "is_positive": True # CPC drop is good
        },
        "conversions": {
            "value": round(total_conversions, 1),
            "formatted": f"{total_conversions:,.1f}",
            "change_pct": 21.6,
            "is_positive": True
        },
        "cost_per_conv": {
            "value": round(cost_per_conv, 2),
            "formatted": f"${cost_per_conv:.2f}",
            "change_pct": -7.5,
            "is_positive": True
        },
        "ctr": {
            "value": round(avg_ctr, 2),
            "formatted": f"{avg_ctr:.2f}%",
            "change_pct": 0.8,
            "is_positive": True
        },
        "conv_rate": {
            "value": round(conv_rate, 2),
            "formatted": f"{conv_rate:.2f}%",
            "change_pct": 1.2,
            "is_positive": True
        },
        "optimization_score": round(avg_opt_score, 1)
    }

@app.get("/api/metrics/timeseries")
def get_timeseries(days: int = 30):
    return generate_timeseries_data(days=days)

@app.get("/api/campaigns")
def get_campaigns(status: Optional[str] = None):
    if status and status.upper() != "ALL":
        return [c for c in campaigns_db if c["status"].upper() == status.upper()]
    return campaigns_db

@app.patch("/api/campaigns/{campaign_id}/status")
def update_campaign_status(campaign_id: str, body: CampaignStatusUpdate):
    for c in campaigns_db:
        if c["id"] == campaign_id:
            c["status"] = body.status.upper()
            return {"success": True, "campaign": c}
    raise HTTPException(status_code=404, detail="Campaign not found")

@app.get("/api/recommendations")
def get_recommendations():
    return [
        {
            "id": "rec_1",
            "title": "Upgrade to Performance Max",
            "description": "Reach audiences across YouTube, Display, Search, Discover, Gmail, and Maps from a single campaign.",
            "impact": "+4.2% score lift",
            "type": "Bidding & Budgets",
            "action_text": "Apply recommendation"
        },
        {
            "id": "rec_2",
            "title": "Add broad match keywords",
            "description": "Help your ads show on more relevant searches that could convert, using smart bidding signals.",
            "impact": "+2.8% score lift",
            "type": "Keywords & Targeting",
            "action_text": "View 14 keywords"
        },
        {
            "id": "rec_3",
            "title": "Improve responsive search ads",
            "description": "Add 3 more headlines and 2 descriptions to increase ad strength from Good to Excellent.",
            "impact": "+1.9% score lift",
            "type": "Ads & Assets",
            "action_text": "Edit assets"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
