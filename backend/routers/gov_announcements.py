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

# 靜態備用資料（當爬蟲全部失敗時顯示）
FALLBACK_DATA = [
    {
        "source_id": "fallback-1",
        "title": "低收入戶生活補助",
        "body": "符合資格之低收入戶每月可申請生活補助金，請攜帶戶口名簿、存摺至戶籍所在地區公所社會課辦理。",
        "tag": "低收入戶",
        "tag_color": "#2563eb",
        "link": "https://www.mohw.gov.tw/cp-16-70-1-45.html",
        "published_at": None,
    },
    {
        "source_id": "fallback-2",
        "title": "中低收入老人生活津貼",
        "body": "65歲以上中低收入老人每月可領取生活津貼，依收入等級分為不同金額，請向各地區公所申請。",
        "tag": "老人福利",
        "tag_color": "#7c3aed",
        "link": "https://www.mohw.gov.tw/cp-16-71-1-45.html",
        "published_at": None,
    },
    {
        "source_id": "fallback-3",
        "title": "急難救助金",
        "body": "家庭遭逢變故（如火災、重病、失業）致生活陷入困境者，可向戶籍地區公所申請急難救助金。",
        "tag": "急難救助",
        "tag_color": "#dc2626",
        "link": "https://www.mohw.gov.tw/cp-16-74-1-45.html",
        "published_at": None,
    },
    {
        "source_id": "fallback-4",
        "title": "身心障礙者生活補助",
        "body": "領有身心障礙證明且符合收入條件者，每月可申請生活補助，請至區公所社會課洽詢。",
        "tag": "身心障礙",
        "tag_color": "#059669",
        "link": "https://www.mohw.gov.tw/cp-16-73-1-45.html",
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
