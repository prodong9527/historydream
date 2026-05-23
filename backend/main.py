import random
import time
import json
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from concurrent.futures import ThreadPoolExecutor

import models
import schemas
from database import engine, get_db, Base
import ai_service

app = FastAPI(title="HistoryDream API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Build tables
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Seed data (3 built-in stories)
# ---------------------------------------------------------------------------
BUILTIN_STORIES = [
    {
        "month": 3,
        "day": 15,
        "year": 754,
        "location": "长安城·西市茶坊",
        "title": "一盏春茶",
        "narrator": "在西市开了四十年茶坊的陆老匠人",
        "content": """三月的长安，风里带着桃花的香气。

我坐在茶坊的木门槛上，手里捧着一碗新炒的春茶。茶汤碧绿，映着门外飘过的柳絮，像是谁不小心把春天揉碎了，撒进了碗里。

那年我二十三岁，刚从江南来到长安，在这间茶坊里学炒茶。师傅说，炒茶要用心，火候要稳，手要轻，像是在哄一个孩子睡觉。我那时不懂，只觉得炒茶是件苦活，手上磨出了茧，胳膊酸得抬不起来。

后来有一天，一个穿白衣的书生来店里喝茶。他坐了整整一个下午，喝了我炒的茶，临走时说了一句："这茶里有人情味。"我不明白他的意思，只是记住了那句话。

几十年过去了，师傅早已作古，茶坊交到了我手里。每年春天，我都会在门口炒一锅新茶，火候稳稳地烧着，手轻轻地翻着。我想起那个书生的话，想起他说"人情味"三个字时眼睛里的光。我终于明白了：炒茶不是苦活，是在把春天的香气，一点一点地揉进人们的日子里。

今年三月十五，我又炒了一锅春茶。茶汤碧绿，柳絮飘过。我坐在门槛上，看着长安城的街人来人往，心里想着：这世上有些事，看似平淡，却能把一整个季节的味道，留在一盏小小的茶碗里。""",
        "image_prompts": [
            "唐代长安西市，茶坊门口老匠人炒茶，柳絮飘飞，水墨淡雅风格，春意盎然",
            "古风工笔，一盏碧绿茶汤，映着窗外桃花，特写镜头，清雅意境",
            "水墨画，长安街景，茶坊门帘轻垂，行人悠然，盛唐气象，温暖色调"
        ],
        "golden_sentence": "一盏茶的温度，刚好能把春天留在心间。",
        "is_builtin": True,
    },
    {
        "month": 6,
        "day": 18,
        "year": 1928,
        "location": "上海·霞飞路裁缝铺",
        "title": "旗袍的针脚",
        "narrator": "霞飞路上做了三十年旗袍的苏裁缝",
        "content": """六月十八那天，雨下了一整个上午。

我坐在裁缝铺的窗边，手里拿着一件未完工的旗袍，针脚细密地缝着。窗外雨声滴答，像是谁在敲着一只小小的鼓。铺子里弥漫着布料的香气，那是上好的丝绸，从苏州运来的。

那年我三十二岁，从乡下来到上海，在这间裁缝铺里当学徒。师傅是个脾气古怪的老头，教我的时候总说："针脚要藏起来，好的旗袍看不见针脚。"我那时笨手笨脚，缝出来的线歪歪斜斜，师傅总是摇头。

后来有一天，一个穿洋装的年轻小姐来店里定旗袍。她要做一件月白色的，参加一场舞会。我接了这个活，躲在角落里，一针一线地缝。舞会那天她来了，穿着我缝的旗袍，站在镜子前转了好几圈，忽然笑了。她说："这件旗袍像是从梦里走出来的。"那一刻，我看见师傅在后面悄悄地点了点头。

几十年过去了，师傅早已不在，裁缝铺交到了我手里。每年六月，我都会做一件月白色的旗袍，针脚细密地藏起来。我想起那个小姐的话，想起她笑的时候眼睛里的光。我终于明白了：做旗袍不是缝布料，是在把女人的梦，一点一点地穿在她们身上。

今年六月十八，窗外又下雨了。我坐在窗边，手里拿着一件月白色的旗袍，针脚细密地缝着。雨声滴答，像是谁在敲着一只小小的鼓。我想着：这世上有些事，看似是针线活，却能把一个人最美的样子，穿进一整段岁月里。""",
        "image_prompts": [
            "1928年上海霞飞路，裁缝铺窗边老匠人缝旗袍，窗外雨天，民国风情，水墨淡彩",
            "民国工笔画，月白色旗袍挂在镜前，细密针脚特写，怀旧优雅气息",
            "水彩风格，上海老裁缝铺内景，丝绸布料堆叠，老式缝纫机，温馨怀旧"
        ],
        "golden_sentence": "最好的针脚看不见，却能穿过岁月，把梦穿在身上。",
        "is_builtin": True,
    },
    {
        "month": 9,
        "day": 10,
        "year": 1983,
        "location": "深圳·蛇口工业区",
        "title": "流水线上的月光",
        "narrator": "从四川来深圳打工三年的林小妹",
        "content": """九月的深圳，夜晚来得很晚。

我站在电子厂的流水线上，手里的零件一个个从面前滑过，像是一条发光的河流。窗外天黑了，厂房里灯还亮着，照得每一张脸都白白的，像是谁在墙上贴了一张张剪纸。

那年我十九岁，从四川坐了三天火车来到深圳。下车的时候天正热，我背着一只帆布包，里头装着两件衣服和一封母亲的信。信上说："到了就写信回来，别舍不得花钱。"我没有写信，只是每个月把钱存起来，攒够了寄回去。

工厂里的人都叫我小妹，因为我年纪最小，说话带着四川口音。每天晚上下班后，我会坐在厂房门口的石阶上，看着天上的月亮。深圳的月亮和四川的月亮不一样，它更亮，像是被谁洗过了一遍。我想起母亲说的那句话："月亮照着的地方，都是家。"

后来有一天，厂里来了一位香港老板，说要给我们涨工资。那天晚上，我把涨的工资寄回了四川，在信上写了一句话："深圳的月亮和家乡的月亮一样亮。"母亲回信说："你长大了。"

三年过去了，我还在这个工厂里，还在流水线上站着。九月十那天晚上，我又坐在厂房门口的石阶上，看着天上的月亮。我想着：这世上有些事，看似是流水线上的零件，却能让人把一整片天空的月光，寄回最远的地方。""",
        "image_prompts": [
            "1983年深圳蛇口，电子厂流水线上女工忙碌，窗外夜色，水彩风格，温暖怀旧",
            "水彩插画，厂房门口石阶上年轻女工望月，城市灯火初上，诗意氛围",
            "深圳工业区夜景，流水线灯光映照女工脸庞，现代感与怀旧感交融，暖色调"
        ],
        "golden_sentence": "流水线上的日子很慢，但月光能把远方的人照亮。",
        "is_builtin": True,
    },
]


def seed_builtin_stories(db: Session):
    import json
    for story_data in BUILTIN_STORIES:
        prompts = story_data.pop("image_prompts")
        exists = (
            db.query(models.HistoricalEvent)
            .filter_by(
                month=story_data["month"],
                day=story_data["day"],
                year=story_data["year"],
                is_builtin=True,
            )
            .first()
        )
        if not exists:
            story_data["image_prompts"] = json.dumps(prompts, ensure_ascii=False)
            db.add(models.HistoricalEvent(**story_data))
    db.commit()


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    seed_builtin_stories(db)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


executor = ThreadPoolExecutor(max_workers=4)


@app.get("/api/generate", response_model=schemas.EventResponse)
def generate_story(theme: str = None, db: Session = Depends(get_db)):
    """
    Generate a new random historical story using AI.
    Called when user opens the app - generates and saves a new story each time.
    """
    from datetime import datetime
    import time
    now = datetime.now()
    month, day = now.month, now.day

    try:
        story_data = ai_service.generate_story(month, day, theme)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"故事生成失败: {str(e)}")

    # 构建高度吻合的图片 prompt
    year = story_data.get("year", 1900)
    location = story_data.get("location", "")
    title = story_data.get("title", "")
    narrator = story_data.get("narrator", "")
    theme_text = theme or "浮生若梦"
    prompts = story_data.get("image_prompts", []) or []

    # 构建丰富且独特的图片 prompt
    # 包含年份、地点、叙述者、主题和原始插画描述
    base_prompt = prompts[0] if prompts else f"{location}的历史场景"
    enhanced_prompt = f"{base_prompt}，{year}年，{location}，{narrator}视角，{theme_text}意境，水墨淡彩风格，温暖怀旧"

    # 生成1张图片，使用时间戳确保唯一性
    image_urls = []
    try:
        url = ai_service.generate_image(enhanced_prompt, seed_offset=int(time.time() * 1000) % 10000)
        if url:
            image_urls.append(url)
    except Exception as e:
        print(f"图片生成失败: {e}")

    # Save to database
    event = models.HistoricalEvent(
        month=month,
        day=day,
        year=story_data["year"],
        location=story_data["location"],
        title=story_data["title"],
        narrator=story_data["narrator"],
        content=story_data["content"],
        image_prompts=json.dumps([enhanced_prompt], ensure_ascii=False),
        image_urls=json.dumps(image_urls, ensure_ascii=False) if image_urls else None,
        golden_sentence=story_data["golden_sentence"],
        is_builtin=False,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.get("/api/random", response_model=schemas.EventResponse)
def get_random_event(db: Session = Depends(get_db)):
    """Pick a random event from the existing database."""
    events = db.query(models.HistoricalEvent).all()
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
    event = random.choice(events)
    return event


@app.get("/api/builtin", response_model=list[schemas.EventResponse])
def get_builtin_events(db: Session = Depends(get_db)):
    return db.query(models.HistoricalEvent).filter_by(is_builtin=True).all()


@app.post("/api/stories/{event_id}/save", response_model=schemas.SavedStoryResponse)
def save_story(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.HistoricalEvent).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    snapshot = {
        "month": event.month,
        "day": event.day,
        "year": event.year,
        "location": event.location,
        "title": event.title,
        "narrator": event.narrator,
        "content": event.content,
        "image_prompts": event.image_prompts,
        "image_urls": event.image_urls,
        "golden_sentence": event.golden_sentence,
    }
    import json
    snapshot_json = json.dumps(snapshot, ensure_ascii=False)

    saved = models.SavedStory(
        event_id=event_id,
        content_snapshot=snapshot_json,
        saved_at=int(time.time()),
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@app.get("/api/history", response_model=list[schemas.SavedStoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(models.SavedStory).order_by(models.SavedStory.saved_at.desc()).all()


@app.delete("/api/history/{story_id}", response_model=schemas.MessageResponse)
def delete_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.SavedStory).filter_by(id=story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(story)
    db.commit()
    return schemas.MessageResponse(message="deleted")


@app.get("/api/events/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.HistoricalEvent).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.get("/api/themes", response_model=schemas.ThemesResponse)
def get_themes():
    """Generate 4 poetic themes for the day, pick one randomly."""
    try:
        themes = ai_service.generate_themes()
        chosen = random.choice(themes)
        return {"themes": themes, "chosen": chosen}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"主题生成失败: {str(e)}")