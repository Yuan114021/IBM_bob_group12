import hashlib
import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
import models

router = APIRouter(prefix="/gov-announcements", tags=["gov-announcements"])

# ── 資料來源設定 ────────────────────────────────────────────────
# 衛福部各類社福 RSS Feed（穩定的官方來源）
SOURCES = [
    {
        "url": "https://www.mohw.gov.tw/rss-16-70-1.html",
        "tag": "低收入戶",
        "tag_color": "#2563eb",
    },
    {
        "url": "https://www.mohw.gov.tw/rss-16-71-1.html",
        "tag": "老人福利",
        "tag_color": "#7c3aed",
    },
    {
        "url": "https://www.mohw.gov.tw/rss-16-73-1.html",
        "tag": "身心障礙",
        "tag_color": "#059669",
    },
    {
        "url": "https://www.mohw.gov.tw/rss-16-74-1.html",
        "tag": "急難救助",
        "tag_color": "#dc2626",
    },
]

# 靜態備用資料（當爬蟲全部失敗時顯示）— 連結均經過驗證可開啟
FALLBACK_DATA = [
    {
        "source_id": "fallback-1",
        "title": "低收入戶生活補助",
        "body": "符合資格之低收入戶每月可申請生活補助金，可了解申請條件、所需文件及補助金額。請向戶籍地區公所社會課提出申請。",
        "tag": "低收入戶",
        "tag_color": "#2563eb",
        "link": "https://www.sfaa.gov.tw/SFAA/Pages/List.aspx?nodeid=385",
        "published_at": None,
    },
    {
        "source_id": "fallback-2",
        "title": "中低收入老人生活津貼",
        "body": "65歲以上中低收入老人每月可領取生活津貼，依家庭收入等級補助金額不同，請向戶籍地區公所社會課申請。",
        "tag": "老人福利",
        "tag_color": "#7c3aed",
        "link": "https://www.sfaa.gov.tw/SFAA/Pages/List.aspx?nodeid=386",
        "published_at": None,
    },
    {
        "source_id": "fallback-3",
        "title": "長期照顧服務（1966專線）",
        "body": "需要居家服務、日間照顧、喘息服務等長照資源，請撥打 1966 長照服務專線，或上 1966 網站查詢附近服務單位。",
        "tag": "老人福利",
        "tag_color": "#7c3aed",
        "link": "https://1966.gov.tw/LTC/lp-4031-201.html",
        "published_at": None,
    },
    {
        "source_id": "fallback-4",
        "title": "急難救助金",
        "body": "家庭遭逢重大變故（火災、重病、失業等）生活陷入困境者，可申請急難救助金。點此查看申請資格、補助金額與所需文件。",
        "tag": "急難救助",
        "tag_color": "#dc2626",
        "link": "https://www.sfaa.gov.tw/SFAA/Pages/List.aspx?nodeid=384",
        "published_at": None,
    },
    {
        "source_id": "fallback-5",
        "title": "身心障礙者生活補助",
        "body": "領有身心障礙證明且符合收入條件者，可申請每月生活補助。點此查看申請資格、補助等級與辦理方式。",
        "tag": "身心障礙",
        "tag_color": "#059669",
        "link": "https://www.sfaa.gov.tw/SFAA/Pages/List.aspx?nodeid=390",
        "published_at": None,
    },
    {
        "source_id": "fallback-6",
        "title": "社會救助福利諮詢（1957專線）",
        "body": "不確定自己符合哪些補助資格？可撥打 1957 福利諮詢專線，由專人協助評估可申請的社會福利項目。",
        "tag": "急難救助",
        "tag_color": "#dc2626",
        "link": "https://www.sfaa.gov.tw/SFAA/Pages/List.aspx?nodeid=383",
        "published_at": None,
    },
]


def _parse_rss(xml_text: str, tag: str, tag_color: str) -> list[dict]:
    """解析 RSS XML，回傳公告清單"""
    soup = BeautifulSoup(xml_text, "xml")
    items = soup.find_all("item")
    results = []
    for item in items[:5]:  # 每個來源最多取 5 筆
        title = item.find("title")
        link = item.find("link")
        desc = item.find("description")
        pub_date = item.find("pubDate")
        if not title:
            continue
        title_text = title.get_text(strip=True)
        source_id = hashlib.md5(title_text.encode()).hexdigest()
        results.append({
            "source_id": source_id,
            "title": title_text,
            "body": BeautifulSoup(desc.get_text(strip=True), "html.parser").get_text() if desc else "",
            "tag": tag,
            "tag_color": tag_color,
            "link": link.get_text(strip=True) if link else "",
            "published_at": pub_date.get_text(strip=True) if pub_date else None,
        })
    return results


async def fetch_and_save(db: Session):
    """爬取所有來源並儲存到資料庫（有新的才新增，不重複）"""
    fetched_any = False
    async with httpx.AsyncClient(timeout=10) as client:
        for source in SOURCES:
            try:
                resp = await client.get(source["url"], follow_redirects=True)
                if resp.status_code != 200:
                    continue
                items = _parse_rss(resp.text, source["tag"], source["tag_color"])
                for item in items:
                    exists = db.query(models.GovAnnouncement).filter(
                        models.GovAnnouncement.source_id == item["source_id"]
                    ).first()
                    if not exists:
                        db.add(models.GovAnnouncement(**item, fetched_at=datetime.utcnow()))
                        fetched_any = True
            except Exception:
                continue
    if fetched_any:
        db.commit()

    # 若資料庫完全沒有資料，寫入備用資料
    count = db.query(models.GovAnnouncement).count()
    if count == 0:
        for item in FALLBACK_DATA:
            db.add(models.GovAnnouncement(**item, fetched_at=datetime.utcnow()))
        db.commit()


@router.get("/")
async def list_announcements(db: Session = Depends(get_db)):
    """回傳最新 20 筆政府公告"""
    items = (
        db.query(models.GovAnnouncement)
        .order_by(models.GovAnnouncement.fetched_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": a.id,
            "title": a.title,
            "body": a.body,
            "tag": a.tag,
            "tag_color": a.tag_color,
            "link": a.link,
            "published_at": a.published_at,
        }
        for a in items
    ]


@router.post("/refresh")
async def refresh_announcements(db: Session = Depends(get_db)):
    """手動觸發重新爬取"""
    await fetch_and_save(db)
    count = db.query(models.GovAnnouncement).count()
    return {"message": "更新完成", "total": count}
